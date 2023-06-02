import * as types from '../action-types';

export const fetchSuggestions = ( siteId ) => ( {
	type: types.SUGGESTIONS_FETCH,
	siteId,
} );

export const storeSuggestions = ( siteId, suggestions ) => ( {
	type: types.SUGGESTIONS_STORE,
	siteId,
	suggestions,
} );

export default {
	fetchSuggestions,
	storeSuggestions,
};
