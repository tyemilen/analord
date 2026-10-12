<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useInstances } from './composables/useInstances';
import FlowerIcon from './components/icons/FlowerIcon.vue';
import WindowComponent from './components/WindowComponent.vue';

const {
	sortedByPing,
	isLoading,
	isPinging,
	loadAndPing,
} = useInstances(['https://searx.space/data/instances.json']);

interface ActiveInstance {
	host: string;
	url: string;
	ping: number;
}

interface PrettyDate {
	hour: number;
	minute: number;
	month: number;
	monthName: string;
}

const activeInstanceIndex = ref(0);

const prettyDate = computed<PrettyDate>(() => {
	const date = new Date();

	return {
		hour: date.getHours(),
		minute: date.getMinutes(),
		month: date.getMonth(),
		monthName: date.toLocaleString('default', { month: 'short' }),
	};
});
const activeInstance = computed<ActiveInstance>(() => {
	const instance = sortedByPing.value[activeInstanceIndex.value];
	return {
		host: instance ? new URL(instance.url).host : '',
		url: instance?.url || '',
		ping: instance?.ping || 0,
	};
});

onMounted(() => {
	loadAndPing();
});

const searchQuery = ref('');
const search = () => {
	window.location.href = new URL(`/search?q=${encodeURIComponent(searchQuery.value)}`, activeInstance.value.url).toString();
};

</script>

<template>
	<div class="w-screen h-screen z-[-1] absolute top-0 left-0 flex justify-center align-center">
		<img src="./assets/flowers-bg.svg" class="w-full h-full object-fill" />
		<div class="w-full h-full bg-white/20 backdrop-filter-[blur(15px)] absolute top-0"></div>
	</div>
	<div v-if="isLoading || isPinging" class="absolute right-0 w-screen h-screen bg-white flex justify-center items-center flex-col gap-4">
		<img src="./assets/flower.svg" class="animate-loading" />
		<p v-if="isLoading">fetching instances</p>
		<p v-if="isPinging">pinging</p>
	</div>
	<div class="w-screen h-screen" v-else>

		<div class="flex flex-col gap-5 items-center pt-10">
			<FlowerIcon />
			<p class="bg-black p-2 pl-4 pr-4 text-white font-serif">ANALORD</p>
			<form class="flex flex-row w-full justify-center items-center gap-2" @submit.prevent="search">
				<div class="w-3/5 flex flex-col">
					<p class="text-xs font-mono font-bold">INPUT</p>
					<input type="text" v-model="searchQuery" class="w-full h-12 bg-white border-2 p-2" />
				</div>
				<div class="flex flex-col">
					<p class="text-xs font-mono font-bold">SEARCH</p>
					<button type="submit" class="h-12 bg-white border-2 p-2">
						<img src="./assets/search-icon.svg" class="h-full">
					</button>
				</div>
			</form>
			<div class="flex gap-2 justify-between">
				<WindowComponent :title='"Instance " + activeInstance.ping + "ms"'>
					<div class="flex gap-2">
						<div class="flex flex-col">
							<p class="font-flower">{{ activeInstance.host }}</p>
						</div>
					</div>
				</WindowComponent>
				<WindowComponent title="Time" class="font-flower">
					<div class="flex flex-col justify-center items-center">
						<p class="text-3xl">{{ prettyDate.hour }}</p>
						<p class="text-xl mt-[-16px]">{{ prettyDate.minute }}</p>
						<p>{{ prettyDate.month }} {{ prettyDate.monthName }}</p>
					</div>
				</WindowComponent>

			</div>
		</div>
	</div>
</template>
