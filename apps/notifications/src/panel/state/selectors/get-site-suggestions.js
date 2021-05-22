/**
 * Internal dependencies
 */
import getSuggestions from './get-suggestions';

export const getSiteSuggestions = ( suggestionsState, siteId ) =>
	suggestionsState.bySite[ siteId ] || [];

export default ( state, siteId ) => getSiteSuggestions( getSuggestions( state ), siteId );
