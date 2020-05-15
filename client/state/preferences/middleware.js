/**
 * Internal dependencies
 */
import { PREFERENCES_SAVE_SUCCESS } from 'state/action-types';
import { requestHomeLayout } from 'state/home/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

const HOME_CELEBRATION_BANNER_DISMISS = /dismissible-card-home-notice-(site-launched|site-created|site-migrated|site-setup-complete)/;

export const preferencesMiddleware = ( store ) => {
	return ( next ) => ( action ) => {
		switch ( action.type ) {
			case PREFERENCES_SAVE_SUCCESS:
				if ( HOME_CELEBRATION_BANNER_DISMISS.test( action.key ) ) {
					// When dismissing primary tasks on My Home, request a layout fetch after this has succeeded
					// This middleware may be removed later when preference actions are not thunks
					// and we can pass through some optional serialized actions to dispatch on success
					const siteId = getSelectedSiteId( store.getState() );
					store.dispatch( requestHomeLayout( siteId ) );
				}
				return next( action );
			default:
				return next( action );
		}
	};
};

export default preferencesMiddleware;
