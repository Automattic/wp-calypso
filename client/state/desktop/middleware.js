/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { NOTIFICATIONS_PANEL_TOGGLE } from '../../state/action-types';

import { NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_RESET } from '../../state/desktop/window-events';

/**
 * Module variables
 */
const debug = debugFactory( 'desktop:middleware' );

/**
 * WP Desktop Middleware
 *
 * WP Desktop cannot subscribe to redux actions directly, so this middleware is
 * used to relay redux actions to the Electron renderer process via window events.
 */
export const desktopMiddleware = () => {
	return ( next ) => ( action ) => {
		switch ( action.type ) {
			case NOTIFICATIONS_PANEL_TOGGLE: {
				debug( 'Dispatching window event for action type: ', action.type );
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_RESET )
				);
				return next( action );
			}

			default:
				return next( action );
		}
	};
};

export default desktopMiddleware;
