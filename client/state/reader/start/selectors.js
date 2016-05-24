/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns true if currently requesting recommendations.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether recommendations are being requested
 */
export function isRequestingRecommendations( state ) {
	return !! state.reader.start.isRequestingRecommendations;
}

/**
 * Returns a single recommendation by ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Integer}  recommendationId  Recommendation ID
 * @return {Object} Recommendation
 */
export function getRecommendationById( state, recommendationId ) {
	return state.reader.start.items[ recommendationId ];
}

/**
 * Returns recommendations.
 *
 * @param  {Object}  state  Global state tree
 * @return {Object} Recommendations
 */
export function getRecommendations( state ) {
	return state.reader.start.items;
}

/**
 * Returns recommendation IDs.
 *
 * @param  {Object}  state  Global state tree
 * @return {Array} Recommendations IDs
 */
export const getRecommendationIds = createSelector(
	( state ) => Object.keys( state.reader.start.items ).map( Number ),
	( state ) => [ state.reader.start.items ]
);

/**
 * Which recommendations has the user already interacted with?
 *
 * @param  {Object}  state  Global state tree
 * @return {Array} Recommendations
 */
export function getRecommendationsInteractedWith( state ) {
	return [];
}
