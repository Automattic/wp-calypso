import { translate } from 'i18n-calypso';
import { getTld } from './get-tld';

const SLD_EXACT_MATCH = 'exact-match';
const SIMILAR_MATCH = 'similar-match';
const TLD_EXACT_MATCH = 'tld-exact';
const TLD_SIMILAR = 'tld-similar';
const TLD_COMMON = 'tld-common';

// NOTE: This is actually a sorted list.
export const VALID_MATCH_REASONS = [
	SLD_EXACT_MATCH,
	SIMILAR_MATCH,
	TLD_EXACT_MATCH,
	TLD_SIMILAR,
	TLD_COMMON,
];

function sortMatchReasons( matchReasons: string[] ) {
	return [ ...matchReasons ].sort(
		( a, b ) => VALID_MATCH_REASONS.indexOf( a ) - VALID_MATCH_REASONS.indexOf( b )
	);
}

function getMatchReasonPhrasesMap( tld: string ) {
	return new Map( [
		[
			TLD_EXACT_MATCH,
			translate( 'Extension ".%(tld)s" matches your query', { args: { tld } } ) as string,
		],
		[
			TLD_SIMILAR,
			translate( 'Extension ".%(tld)s" closely matches your query', { args: { tld } } ) as string,
		],
		[ 'exact-match', translate( 'Exact match' ) as string ],
		[ SIMILAR_MATCH, translate( 'Close match' ) as string ],
		[
			TLD_COMMON,
			tld === 'com'
				? ( translate( '".com" is the most common extension' ) as string )
				: ( translate( '".%(tld)s" is a common extension', { args: { tld } } ) as string ),
		],
	] );
}

export function parseMatchReasons( domain: string, matchReasons: string[] ) {
	const matchReasonsMap = getMatchReasonPhrasesMap( getTld( domain ) );

	return sortMatchReasons( matchReasons )
		.filter( ( matchReason ) => matchReasonsMap.has( matchReason ) )
		.map( ( matchReason ) => matchReasonsMap.get( matchReason )! );
}
