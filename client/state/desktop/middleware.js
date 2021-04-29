/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { NOTIFICATIONS_UNSEEN_COUNT_SET } from '../../state/action-types';

import { NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_SET } from '../../state/desktop/window-events';

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
			case NOTIFICATIONS_UNSEEN_COUNT_SET: {
				debug( 'Dispatching window event for action type: ', action.type );
				const { unseenCount } = action;
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_SET, {
						detail: {
							unseenCount,
						},
					} )
				);
				return next( action );
			}

			default:
				return next( action );
		}
	};
};

export default desktopMiddleware;
