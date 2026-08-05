<script lang="ts">
	// A textarea with a highlighted <pre> behind it. The textarea's text is
	// transparent (only the caret shows); the backdrop renders the same text
	// with <mark> spans for errors and the hovered tree node.
	interface Props {
		value: string;
		html: string;
		onCursor?: (index: number) => void;
	}

	let { value = $bindable(), html, onCursor }: Props = $props();

	let textarea: HTMLTextAreaElement | undefined = $state();
	let backdrop: HTMLElement | undefined = $state();

	/** Select a character range and scroll it into view (used by the tree). */
	export function select(start: number, end: number) {
		if (!textarea) return;
		textarea.focus();
		textarea.setSelectionRange(start, end);
		const line = value.slice(0, start).split('\n').length - 1;
		const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
		textarea.scrollTop = Math.max(0, line * lineHeight - textarea.clientHeight / 2);
		syncScroll();
		onCursor?.(start);
	}

	function syncScroll() {
		if (!backdrop || !textarea) return;
		backdrop.scrollTop = textarea.scrollTop;
		backdrop.scrollLeft = textarea.scrollLeft;
	}

	function report() {
		if (onCursor && textarea) onCursor(textarea.selectionStart);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Tab' && textarea) {
			event.preventDefault();
			const { selectionStart, selectionEnd } = textarea;
			textarea.setRangeText('  ', selectionStart, selectionEnd, 'end');
			value = textarea.value;
			report();
		}
	}
</script>

<div class="editor relative h-full min-h-0">
	<pre class="backdrop" bind:this={backdrop} aria-hidden="true"><code>{@html html}{'\n'}</code></pre>
	<textarea
		bind:this={textarea}
		bind:value
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
		wrap="off"
		aria-label="json source"
		onscroll={syncScroll}
		oninput={report}
		onclick={report}
		onkeyup={report}
		{onkeydown}
	></textarea>
</div>

<style>
	.backdrop,
	textarea {
		position: absolute;
		inset: 0;
		margin: 0;
		border: 0;
		padding: 0.75rem 1rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 13.5px;
		line-height: 1.65;
		tab-size: 2;
		white-space: pre;
		background: transparent;
		color: var(--color-gray-800);
	}

	.backdrop {
		overflow: hidden;
		pointer-events: none;
	}

	.backdrop code {
		font: inherit;
		background: none;
		padding: 0;
	}

	textarea {
		overflow: auto;
		color: transparent;
		caret-color: var(--color-dark-500);
		resize: none;
		outline: none;
	}

	textarea::selection {
		background: color-mix(in srgb, var(--color-tertiary-500) 30%, transparent);
		color: transparent;
	}

	.editor :global(mark) {
		color: inherit;
		background: transparent;
	}

	.editor :global(mark.err) {
		background: var(--color-red-100);
		color: var(--color-red-700);
		text-decoration: underline wavy var(--color-red-500);
		text-underline-offset: 3px;
	}

	.editor :global(mark.hl) {
		background: color-mix(in srgb, var(--color-secondary-500) 35%, transparent);
		border-radius: 2px;
	}
</style>
