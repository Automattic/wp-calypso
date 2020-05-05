import * as types from '../../action-types';
import actions from '../../actions';

import hasSiteSuggestions from '../../selectors/has-site-suggestions';
import { fetchSuggestions } from '../../../rest-client/wpcom';

let isFetchingSuggestions = false;

const getUsersSuggestions = ( { dispatch, getState }, { siteId } ) => {
	if ( isFetchingSuggestions || hasSiteSuggestions( getState(), siteId ) ) {
		return;
	}

	isFetchingSuggestions = true;

	fetchSuggestions(
		{
			site_id: siteId,
		},
		( error, data ) => {
			isFetchingSuggestions = false;

			if ( error ) {
				return;
			}

			// Create a composite index to search against of; username + real name
			// This will also determine ordering of results, so username matches will appear on top
			const newSuggestions = data.suggestions.map( ( suggestion ) => ( {
				...suggestion,
				name: suggestion.name || `${ suggestion.user_login } ${ suggestion.display_name }`,
			} ) );

			dispatch( actions.suggestions.storeSuggestions( siteId, newSuggestions ) );
		}
	);
};

export default {
	[ types.SUGGESTIONS_FETCH ]: [ getUsersSuggestions ],
};
