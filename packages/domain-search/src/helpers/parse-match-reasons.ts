import { __, sprintf } from '@wordpress/i18n';
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
			/* translators: %(tld)s is the TLD */
			sprintf( __( 'Extension ".%(tld)s" matches your query' ), { tld } ),
		],
		[
			TLD_SIMILAR,
			/* translators: %(tld)s is the TLD */
			sprintf( __( 'Extension ".%(tld)s" closely matches your query' ), { tld } ),
		],
		[ 'exact-match', __( 'Exact match' ) ],
		[ SIMILAR_MATCH, __( 'Close match' ) ],
		[
			TLD_COMMON,
			tld === 'com'
				? __( '".com" is the most common extension' )
				: /* translators: %(tld)s is the TLD */
				  sprintf( __( '".%(tld)s" is a common extension' ), { tld } ),
		],
	] );
}

export function parseMatchReasons( domain: string, matchReasons: string[] ) {
	const matchReasonsMap = getMatchReasonPhrasesMap( getTld( domain ) );

	return sortMatchReasons( matchReasons )
		.filter( ( matchReason ) => matchReasonsMap.has( matchReason ) )
		.map( ( matchReason ) => matchReasonsMap.get( matchReason )! );
}
