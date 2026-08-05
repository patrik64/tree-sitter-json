// Turns the source string plus a set of highlight spans into the HTML for
// the editor backdrop. Overlapping spans are handled by splitting the text
// at every span boundary and stacking class names per segment.
export interface Span {
	start: number;
	end: number;
	cls: string;
}

const escapeHtml = (s: string) =>
	s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function renderHighlights(source: string, spans: Span[]): string {
	const bounds = new Set<number>([0, source.length]);
	for (const s of spans) {
		bounds.add(Math.max(0, Math.min(s.start, source.length)));
		bounds.add(Math.max(0, Math.min(s.end, source.length)));
	}
	const points = [...bounds].sort((a, b) => a - b);

	let html = '';
	for (let i = 0; i < points.length - 1; i++) {
		const [from, to] = [points[i], points[i + 1]];
		const text = escapeHtml(source.slice(from, to));
		const classes = spans.filter((s) => s.start <= from && to <= s.end).map((s) => s.cls);
		html += classes.length ? `<mark class="${[...new Set(classes)].join(' ')}">${text}</mark>` : text;
	}
	return html;
}
