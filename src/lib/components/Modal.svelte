<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onclose,
		children,
		maxWidth = 'sm:max-w-lg'
	}: { onclose: () => void; children: Snippet; maxWidth?: string } = $props();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div
	class="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 select-none sm:inset-0 sm:flex sm:items-center sm:justify-center"
>
	<div class="fixed inset-0 transition-opacity">
		<div class="absolute inset-0 bg-gray-500 opacity-75"></div>
	</div>

	<div
		class="relative z-20 transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl transition-all sm:w-full {maxWidth} sm:p-6"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-headline"
	>
		<div class="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
			<button
				type="button"
				onclick={onclose}
				class="text-gray-400 transition duration-150 ease-in-out hover:text-gray-500 focus:text-gray-500 focus:outline-none"
				aria-label="Close"
			>
				<svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		{@render children()}
	</div>
</div>
