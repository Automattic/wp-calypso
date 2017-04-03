/**
 * Internal dependencies
 */
import { THEME_FILTERS_REQUEST } from 'state/action-types';
import { receiveThemeFilters } from 'state/themes/actions';
import wpcom from 'lib/wp';

const fetchThemeFilters = ( { dispatch } ) =>
	wpcom.req.get( '/theme-filters', { apiVersion: '1.2' } )
		.then( ( themeFilters ) => {
			dispatch( receiveThemeFilters( themeFilters ) );
		} );
		// TODO: catch and dispatch failure action

export default {
	[ THEME_FILTERS_REQUEST ]: [ fetchThemeFilters ],
};
