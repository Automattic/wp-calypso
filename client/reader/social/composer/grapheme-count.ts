const graphemeSegmenter =
	typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined'
		? new Intl.Segmenter( undefined, { granularity: 'grapheme' } )
		: null;

export function countGraphemes( text: string ): number {
	if ( ! text ) {
		return 0;
	}
	if ( graphemeSegmenter ) {
		let count = 0;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for ( const _ of graphemeSegmenter.segment( text ) ) {
			count++;
		}
		return count;
	}
	// Fallback for environments without Intl.Segmenter — count code points.
	// This over-counts multi-codepoint graphemes but is a strict upper
	// bound, so it errs toward "too long" which is safe.
	return Array.from( text ).length;
}

const wordSegmenter =
	typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined'
		? new Intl.Segmenter( undefined, { granularity: 'word' } )
		: null;

/**
 * Count words in `text` via `Intl.Segmenter` with word granularity —
 * locale-aware so CJK and other non-space-delimited scripts are handled
 * correctly (the same fix Mastodon's web frontend applies for word
 * counting). Falls back to a whitespace split for environments without
 * `Intl.Segmenter`. Used by the Fediverse composer's word-based
 * threshold for the blog-post overflow handoff — AP posts are
 * blog-post-shaped, so word counts map onto "this is getting long"
 * better than grapheme caps.
 */
export function countWords( text: string ): number {
	const trimmed = text.trim();
	if ( ! trimmed ) {
		return 0;
	}
	if ( wordSegmenter ) {
		let count = 0;
		for ( const segment of wordSegmenter.segment( trimmed ) ) {
			if ( segment.isWordLike ) {
				count++;
			}
		}
		return count;
	}
	// Whitespace-delimited fallback. Over-counts hyphenated tokens, under-
	// counts CJK — acceptable for environments without `Intl.Segmenter`.
	return trimmed.split( /\s+/ ).length;
}
