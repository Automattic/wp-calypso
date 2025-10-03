import { translate } from 'i18n-calypso';
import { getTld } from './get-tld';

const TLD_EXACT_MATCH = 'tld-exact';
const SLD_EXACT_MATCH = 'exact-match';

// NOTE: This is actually a sorted list.
const VALID_MATCH_REASONS = [
	SLD_EXACT_MATCH,
	'similar-match',
	TLD_EXACT_MATCH,
	'tld-similar',
	'tld-common',
];

function sortMatchReasons( matchReasons: string[] ) {
	return [ ...matchReasons ].sort(
		( a, b ) => VALID_MATCH_REASONS.indexOf( a ) - VALID_MATCH_REASONS.indexOf( b )
	);
}

function getMatchReasonPhrasesMap( tld: string ) {
	return new Map( [
		[
			'tld-exact',
			translate( 'Extension ".%(tld)s" matches your query', { args: { tld } } ) as string,
		],
		[
			'tld-similar',
			translate( 'Extension ".%(tld)s" closely matches your query', { args: { tld } } ) as string,
		],
		[ 'exact-match', translate( 'Exact match' ) as string ],
		[ 'similar-match', translate( 'Close match' ) as string ],
		[
			'tld-common',
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
