/** @format */

/**
 * External dependencies
 */
import { includes } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getTld } from 'lib/domains';

const newTlds = [
	'.art',
	'.bar',
	'.beer',
	'.buzz',
	'.cab',
	'.casa',
	'.click',
	'.coffee',
	'.cooking',
	'.design',
	'.fashion',
	'.fishing',
	'.fit',
	'.garden',
	'.gift',
	'.golf',
	'.group',
	'.help',
	'.horse',
	'.hospital',
	'.ink',
	'.jetzt',
	'.link',
	'.lol',
	'.miami',
	'.mom',
	'.money',
	'.movie',
	'.network',
	'.photo',
	'.pics',
	'.rest',
	'.rodeo',
	'.sexy',
	'.style',
	'.surf',
	'.tattoo',
	'.vip',
	'.vodka',
	'.wedding',
	'.wiki',
	'.work',
	'.wtf',
	'.yoga',
];

const testTlds = [ '.de' ];

export function isNewTld( tld ) {
	return includes( newTlds, tld );
}

export function isTestTld( tld ) {
	return includes( testTlds, tld );
}

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
				? translate( 'Most common extension, ".com"' )
				: translate( 'Common extension, ".%(tld)s"', { args: { tld } } ),
		],
	] );
}

export function parseMatchReasons( domain, matchReasons ) {
	const matchReasonsMap = getMatchReasonPhrasesMap( getTld( domain ) );

	return sortMatchReasons( matchReasons )
		.filter( matchReason => matchReasonsMap.has( matchReason ) )
		.map( matchReason => matchReasonsMap.get( matchReason ) );
}
