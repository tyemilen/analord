import { computed, ref } from 'vue';

export interface Instance {
	url: string;
	ping: number;
}

export interface CachedInstances {
	instances: Instance[];
	updatedAt: number;
}

export interface InstanceProviderResponse {
	network_type: 'normal' | 'onion';
	engines: Record<string, object[]>;
}

export interface ProviderPayload {
	instances: Record<string, InstanceProviderResponse>;
}

const UPDATE_TIMEOUT_MS = 240 * 1000;

export async function pingInstance(url: string, timeoutMs = 2500): Promise<number> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);
	const start = performance.now();

	try {
		await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
		return Math.round(performance.now() - start);
	}
	catch {
		return 99999;
	}
	finally {
		clearTimeout(id);
	}
}

export async function fetchProviders(providers: string[]): Promise<Instance[]> {
	const fetchedInstances: Instance[] = [];

	for (const provider of providers) {
		try {
			const res = await fetch(provider);
			const data: ProviderPayload = await res.json();

			for (const [url, instance] of Object.entries(data.instances)) {
				if (instance.network_type === 'normal' && instance.engines) {
					fetchedInstances.push({ url, ping: -1 });
				}
			}
		}
		catch (err) {
			console.error(`Failed fetching from provider: ${provider}`, err);
		}
	}
	return fetchedInstances;
}

export function isCacheValid(cached: CachedInstances | null): boolean {
	if (!cached) return false;
	return (Date.now() - cached.updatedAt) < UPDATE_TIMEOUT_MS;
}

const CACHE_KEY = 'cached_instances';

export function useInstances(providerUrls: string[]) {
	const instances = ref<Instance[]>([]);
	const isLoading = ref(false);
	const isPinging = ref(false);

	const onlineInstances = computed(() => instances.value.filter(i => i.ping > -1));
	const sortedByPing = computed(() => [...onlineInstances.value].sort((a, b) => a.ping - b.ping));

	function saveToCache() {
		const payload: CachedInstances = {
			instances: instances.value,
			updatedAt: Date.now(),
		};
		localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
	}

	function loadFromCache(): CachedInstances | null {
		const raw = localStorage.getItem(CACHE_KEY);
		return raw ? JSON.parse(raw) : null;
	}

	async function loadAndPing() {
		isLoading.value = true;

		const cached = loadFromCache();
		if (isCacheValid(cached)) {
			instances.value = cached!.instances;
			isLoading.value = false;
			return;
		}

		instances.value = await fetchProviders(providerUrls);
		saveToCache();
		isLoading.value = false;

		await triggerPivotalPings();
	}

	async function triggerPivotalPings() {
		if (isPinging.value) return;
		isPinging.value = true;

		await Promise.all(
			instances.value.map(async (instance) => {
				instance.ping = await pingInstance(instance.url);
			}),
		);

		saveToCache();
		isPinging.value = false;
	}

	return {
		instances,
		onlineInstances,
		sortedByPing,
		isLoading,
		isPinging,
		loadAndPing,
		rePingAll: triggerPivotalPings,
	};
}
