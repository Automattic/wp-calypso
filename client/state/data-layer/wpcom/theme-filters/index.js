/**
 * Internal dependencies
 */
import THEME_FILTERS_REQUEST from 'state/action-types';
import receiveThemeFilters from 'state/themes/actions';
import wpcom from 'lib/wp';

const apiResponse = ( dispatch ) => data => dispatch( receiveThemeFilters( data ) );

const fetchThemeFilters = ( { dispatch } ) =>
	wpcom.req.get( '/v1.2/theme-filters' )
		.then( apiResponse( dispatch ) );
		// TODO: catch and dispatch failure action

export default {
	[ THEME_FILTERS_REQUEST ]: [ fetchThemeFilters ],
};
