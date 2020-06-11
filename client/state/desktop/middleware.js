/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	CANNOT_USE_EDITOR,
	SITE_REQUEST_SUCCESS,
	SITE_REQUEST_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE,
} from '../../state/action-types';

import {
	NOTIFY_DESKTOP_CANNOT_USE_EDITOR,
	NOTIFY_DESKTOP_DID_REQUEST_SITE,
	NOTIFY_DESKTOP_DID_ACTIVATE_JETPACK_MODULE,
} from '../../state/desktop/window-events';

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
			case CANNOT_USE_EDITOR: {
				debug( 'Dispatching window event for action type: ', action.type );
				const { site, reason, editorUrl, wpAdminLoginUrl } = action;
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_CANNOT_USE_EDITOR, {
						detail: {
							site,
							reason,
							editorUrl,
							wpAdminLoginUrl,
						},
					} )
				);
				return next( action );
			}

			case JETPACK_MODULE_ACTIVATE_SUCCESS:
				debug( 'Dispatching window event for action type: ', action.type );
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_DID_ACTIVATE_JETPACK_MODULE, {
						detail: {
							status: 'success',
							siteId: action.siteId,
						},
					} )
				);
				return next( action );

			case JETPACK_MODULE_ACTIVATE_FAILURE:
				debug( 'Dispatching window event for action type: ', action.type );
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_DID_ACTIVATE_JETPACK_MODULE, {
						detail: {
							status: 'error',
							siteId: action.siteId,
							error: action.error,
						},
					} )
				);
				return next( action );

			case SITE_REQUEST_SUCCESS:
				debug( 'Dispatching desktop window event for action type: ', action.type );
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_DID_REQUEST_SITE, {
						detail: {
							status: 'success',
							siteId: action.siteId,
						},
					} )
				);
				return next( action );

			case SITE_REQUEST_FAILURE:
				debug( 'Dispatching desktop window event for action type: ', action.type );
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_DID_REQUEST_SITE, {
						detail: {
							status: 'error',
							siteId: action.siteId,
							error: action.error,
						},
					} )
				);
				return next( action );

			default:
				return next( action );
		}
	};
};

export default desktopMiddleware;
