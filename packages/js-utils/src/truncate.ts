export interface TruncateOptions {
	/** The maximum string length. Defaults to `30`. */
	length?: number;
	/** The string to indicate text is omitted. Defaults to `'...'`. */
	omission?: string;
	/** The separator pattern to truncate to. */
	separator?: string | RegExp;
}

import isSymbol from './is-symbol';
import toFinite from './to-finite';

const DEFAULT_LENGTH = 30;
const DEFAULT_OMISSION = '...';

// Coerces `length` via `toInteger` (toward-zero integer of `toFinite`).
const toInteger = ( value: unknown ): number => Math.trunc( toFinite( value ) );

// `baseToString` differs from native `String` in two ways: symbols (primitive
// or boxed) stringify to their description rather than throwing, and negative
// zero becomes `'-0'`.
const baseToString = ( value: unknown ): string => {
	if ( typeof value === 'string' ) {
		return value;
	}
	if ( Array.isArray( value ) ) {
		return value.map( baseToString ).join( ',' );
	}
	if ( isSymbol( value ) ) {
		return Symbol.prototype.toString.call( value as symbol );
	}
	const result = `${ value }`;
	return result === '0' && Object.is( value, -0 ) ? '-0' : result;
};

// Unicode-aware string segmentation so that grapheme clusters (ZWJ emoji
// sequences, regional-indicator flags, combining marks, variation selectors,
// Fitzpatrick modifiers) are counted and sliced as single units rather than
// split per code point.
const rsAstralRange = '\\ud800-\\udfff';
const rsComboMarksRange = '\\u0300-\\u036f';
const reComboHalfMarksRange = '\\ufe20-\\ufe2f';
const rsComboSymbolsRange = '\\u20d0-\\u20ff';
const rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
const rsVarRange = '\\ufe0e\\ufe0f';
const rsAstral = '[' + rsAstralRange + ']';
const rsCombo = '[' + rsComboRange + ']';
const rsFitz = '\\ud83c[\\udffb-\\udfff]';
const rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
const rsNonAstral = '[^' + rsAstralRange + ']';
const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
const rsZWJ = '\\u200d';
const reOptMod = rsModifier + '?';
const rsOptVar = '[' + rsVarRange + ']?';
const rsOptJoin =
	'(?:' +
	rsZWJ +
	'(?:' +
	[ rsNonAstral, rsRegional, rsSurrPair ].join( '|' ) +
	')' +
	rsOptVar +
	reOptMod +
	')*';
const rsSeq = rsOptVar + reOptMod + rsOptJoin;
const rsSymbol =
	'(?:' +
	[ rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral ].join( '|' ) +
	')';
const reUnicode = RegExp( rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g' );
// Unicode-detection class: it intentionally combines ZWJ, surrogate,
// combining-mark, and variation-selector ranges and matches on UTF-16 code
// units (no `u` flag), which the rule misreads as a mistake.
// eslint-disable-next-line no-misleading-character-class
const reHasUnicode = RegExp( '[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']' );

const stringToArray = ( string: string ): string[] =>
	reHasUnicode.test( string ) ? string.match( reUnicode ) ?? [] : string.split( '' );

/**
 * Truncates `string` if it is longer than the given maximum length, replacing
 * the excess with `omission`. Supports the
 * `separator` option (truncate to a word/pattern boundary), lenient option
 * coercion (non-object options and oddly-typed `length`/`omission` fall back or
 * coerce rather than throw), and Unicode-aware length/slicing so grapheme
 * clusters such as emoji, flags, and accented characters are never split.
 * @param string  The string to truncate.
 * @param options Truncation options.
 * @returns The truncated string.
 */
const truncate = ( string: string, options?: TruncateOptions ): string => {
	// Only plain objects/arrays contribute options; `length` is coerced with
	// `toInteger` and `omission` with `String`, so non-object or oddly-typed
	// inputs fall back to defaults instead of throwing.
	let length = DEFAULT_LENGTH;
	let omission = DEFAULT_OMISSION;
	let separator: string | RegExp | undefined;
	if ( typeof options === 'object' && options !== null ) {
		if ( 'separator' in options ) {
			separator = options.separator;
		}
		if ( 'length' in options ) {
			length = toInteger( options.length );
		}
		if ( 'omission' in options ) {
			omission = baseToString( options.omission );
		}
	}

	const str = baseToString( string ?? '' );

	let strLength = str.length;
	let strSymbols: string[] | undefined;
	if ( reHasUnicode.test( str ) ) {
		// Already known to be Unicode, so segment directly rather than via
		// `stringToArray`, which would re-run `reHasUnicode.test`.
		strSymbols = str.match( reUnicode ) ?? [];
		strLength = strSymbols.length;
	}

	if ( length >= strLength ) {
		return str;
	}

	let end = length - stringToArray( omission ).length;
	if ( end < 1 ) {
		return omission;
	}

	let result = strSymbols ? strSymbols.slice( 0, end ).join( '' ) : str.slice( 0, end );

	if ( separator === undefined ) {
		return result + omission;
	}

	// For Unicode strings the symbol count and UTF-16 length differ; align `end`
	// to the result's UTF-16 length for the index-based separator logic below.
	if ( strSymbols ) {
		end += result.length - end;
	}

	if ( separator instanceof RegExp ) {
		// Only trim back to a boundary if the cut doesn't already land on one.
		if ( str.slice( end ).search( separator ) !== 0 ) {
			const flags = separator.flags.includes( 'g' ) ? separator.flags : separator.flags + 'g';
			const matcher = new RegExp( separator.source, flags );
			let match;
			let boundary;
			while ( ( match = matcher.exec( result ) ) ) {
				boundary = match.index;
				// Guard against zero-width matches looping forever.
				if ( match.index === matcher.lastIndex ) {
					matcher.lastIndex++;
				}
			}
			result = result.slice( 0, boundary === undefined ? end : boundary );
		}
	} else if ( str.indexOf( separator, end ) !== end ) {
		const index = result.lastIndexOf( separator );
		if ( index > -1 ) {
			result = result.slice( 0, index );
		}
	}

	return result + omission;
};

export default truncate;
