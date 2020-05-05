/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getTld } from 'lib/domains';

// NOTE: This is actually a sorted list.
export const VALID_MATCH_REASONS = [
	'exact-match',
	'similar-match',
	'tld-exact',
	'tld-similar',
	'tld-common',
];

function sortMatchReasons( matchReasons ) {
	return [ ...matchReasons ].sort(
		( a, b ) => VALID_MATCH_REASONS.indexOf( a ) - VALID_MATCH_REASONS.indexOf( b )
	);
}

function getMatchReasonPhrasesMap( tld ) {
	return new Map( [
		[ 'tld-exact', translate( 'Extension ".%(tld)s" matches your query', { args: { tld } } ) ],
		[
			'tld-similar',
			translate( 'Extension ".%(tld)s" closely matches your query', { args: { tld } } ),
		],
		[ 'exact-match', translate( 'Exact match' ) ],
		[ 'similar-match', translate( 'Close match' ) ],
		[
			'tld-common',
			tld === 'com'
				? translate( '".com" is the most common extension' )
				: translate( '".%(tld)s" is a common extension', { args: { tld } } ),
		],
	] );
}

export function parseMatchReasons( domain, matchReasons ) {
	const matchReasonsMap = getMatchReasonPhrasesMap( getTld( domain ) );

	return sortMatchReasons( matchReasons )
		.filter( ( matchReason ) => matchReasonsMap.has( matchReason ) )
		.map( ( matchReason ) => matchReasonsMap.get( matchReason ) );
}
