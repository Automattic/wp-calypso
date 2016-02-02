/**
 * External dependencies
 */
import { memoize } from 'lodash/function';

const postIdEndpoints = [ 'statsVideo', 'statsPostViews' ];
const undocumentedEndpoints = [ 'statsEvents', 'statsInsights' ];
const documentedEndpoints = [
	'stats', 'statsClicks', 'statsCommentFollowers',
	'statsComments', 'statsCountryViews', 'statsFollowers',
	'statsPostViews', 'statsPublicize', 'statsReferrers',
	'statsStreak', 'statsTopAuthors', 'statsTags',
	'statsVideoPlays', 'statsVisits', 'statsSearchTerms',
	'statsTopPosts', 'statsVideo'
];

export const isPostIdEndpoint = memoize( ( statType ) => {
	return postIdEndpoints.includes( statType );
} );

export const isDocumentedEndpoint = memoize( ( statType ) => {
	return documentedEndpoints.includes( statType );
} );

export const isUndocumentedEndpoint = memoize( ( statType ) => {
	return undocumentedEndpoints.includes( statType );
} );

export function getValidEndpoints() {
	return undocumentedEndpoints.concat( documentedEndpoints ).join( ', ' );
}
