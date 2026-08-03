// Detection of the legacy style-variation CSS block that older versions of the
// Easy Site Editor injected into the user's Additional CSS (`styles.css`):
//
//   /* easy-site-editor-style-variation:start */
//   body .wp-site-blocks h1, … {font-family:var(--wp--preset--…) !important;}
//   /* easy-site-editor-style-variation:end */
//
// Nothing writes the block any more, but sites touched by the old version still
// carry it, and its `!important` typography permanently overrides any font the
// user later picks (ESE-20). Detection subset of Big Sky's
// `shared/legacy-style-variation-css` — the consent dialog and removal flow are
// Big Sky's and port together with `set-styles`.

export const LEGACY_CSS_START = '/* easy-site-editor-style-variation:start */';
export const LEGACY_CSS_END = '/* easy-site-editor-style-variation:end */';

export interface LegacyBlock {
	/** Index the block starts at, including any absorbed leading whitespace. */
	start: number;
	/** Index just past the closing marker. */
	end: number;
	/** The block as shown to the user, without leading blank lines. */
	text: string;
}

function isRecord( value: unknown ): value is Record< string, unknown > {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

/**
 * Find every well-formed legacy block in a stylesheet.
 *
 * Pairs each start marker with the nearest following end marker and resumes the
 * scan past it, so the blocks returned are always sequential and
 * non-overlapping. A start marker with no matching end is skipped — its extent
 * is unknowable. An empty result is the single "nothing to report" signal.
 */
export function findLegacyBlocks( css: string ): LegacyBlock[] {
	if ( typeof css !== 'string' || ! css ) {
		return [];
	}

	const found: LegacyBlock[] = [];
	let from = 0;

	for (;;) {
		const markerStart = css.indexOf( LEGACY_CSS_START, from );
		if ( markerStart === -1 ) {
			break;
		}

		const endIndex = css.indexOf( LEGACY_CSS_END, markerStart + LEGACY_CSS_START.length );
		if ( endIndex === -1 ) {
			// Orphaned start marker — nothing safe left to find.
			break;
		}

		const end = endIndex + LEGACY_CSS_END.length;

		// Absorb preceding whitespace so a future removal leaves no gap.
		let start = markerStart;
		while ( start > 0 && /\s/.test( css[ start - 1 ] ) ) {
			start--;
		}

		found.push( { start, end, text: css.slice( start, end ).trim() } );
		from = end;
	}

	return found;
}

/**
 * Read the CSS string out of a `styles.css` value — WP stores it either as a
 * bare string or as a `{ css: string }` object. Any other shape returns `null`,
 * which callers treat exactly like "no blocks found".
 */
export function readCustomCss( value: unknown ): string | null {
	if ( typeof value === 'string' ) {
		return value;
	}

	if ( isRecord( value ) && typeof value.css === 'string' ) {
		return value.css;
	}

	return null;
}

/**
 * Find the legacy blocks in a raw `styles.css` value of either supported shape.
 */
export function findLegacyBlocksInStylesValue( value: unknown ): LegacyBlock[] {
	const css = readCustomCss( value );
	return css === null ? [] : findLegacyBlocks( css );
}
