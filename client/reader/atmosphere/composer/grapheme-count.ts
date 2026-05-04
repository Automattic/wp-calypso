const segmenter =
	typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined'
		? new Intl.Segmenter( undefined, { granularity: 'grapheme' } )
		: null;

export function countGraphemes( text: string ): number {
	if ( ! text ) {
		return 0;
	}
	if ( segmenter ) {
		let count = 0;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for ( const _ of segmenter.segment( text ) ) {
			count++;
		}
		return count;
	}
	// Fallback for environments without Intl.Segmenter — count code points.
	// This over-counts multi-codepoint graphemes but is a strict upper
	// bound, so it errs toward "too long" which is safe.
	return Array.from( text ).length;
}
