/**
 * Internal dependencies
 */
import { keyedReducer } from 'calypso/state/utils';
import { SIGNUP_VERTICALS_SET } from 'calypso/state/action-types';

export default keyedReducer( 'siteType', ( state = null, action ) => {
	if ( action.type === SIGNUP_VERTICALS_SET ) {
		return {
			...state,
			[ action.search.trim().toLowerCase() ]: action.verticals,
		};
	}
	return state;
} );
