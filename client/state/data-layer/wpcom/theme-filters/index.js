/**
 * Internal dependencies
 */
import { THEME_FILTERS_REQUEST } from 'state/action-types';
import {
	receiveThemeFilters,
	receiveThemeFiltersFailure,
} from 'state/themes/actions';
import wpcom from 'lib/wp';

export const fetchThemeFilters = ( { dispatch } ) =>
	wpcom.req.get( '/theme-filters', { apiVersion: '1.2' } )
		.then( ( themeFilters ) => {
			dispatch( receiveThemeFilters( themeFilters ) );
		} )
		.catch( ( error ) => {
			dispatch( receiveThemeFiltersFailure( error ) );
		} );

export default {
	[ THEME_FILTERS_REQUEST ]: [ fetchThemeFilters ],
};
