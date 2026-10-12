<script setup lang="ts">
defineProps<{
	title: string
}>();
</script>
<template>
	<div class="border-2 h-fit">
		<div class="w-full h-6 bg-black text-white pl-2 pr-2 text-sm flex items-center font-flower">
			<p>{{ title }}</p>
		</div>
		<div class="p-2 bg-white">
			<slot />
		</div>
	</div>
</template>