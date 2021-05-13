/**
 * Internal dependencies
 */
import getSuggestions from './get-suggestions';

export const hasSiteSuggestions = ( suggestionsState, siteId ) =>
	suggestionsState.bySite.hasOwnProperty( siteId );

export default ( state, siteId ) => hasSiteSuggestions( getSuggestions( state ), siteId );
