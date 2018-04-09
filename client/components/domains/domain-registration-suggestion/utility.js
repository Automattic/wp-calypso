/** @format */

/**
 * External dependencies
 */
import { includes } from 'lodash';

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

export function getMatchReasonPhrasesMap( tld ) {
	return new Map( [
		[ 'tld-exact', `Extension ".${ tld }" matches your query` ],
		[ 'tld-similar', `Extension ".${ tld }" closely matches your query` ],
		[ 'exact-match', 'Exact match left of the dot' ],
		[ 'similar-match', 'Close match left of the dot' ],
		[ 'tld-common', `Most common extension, ".${ tld }"` ],
	] );
}

export function isNewTld( tld ) {
	return includes( newTlds, tld );
}

export function isTestTld( tld ) {
	return includes( testTlds, tld );
}
