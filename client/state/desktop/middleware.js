/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	CANNOT_USE_EDITOR,
	EDITOR_VIEW_POST_CLICKED,
	SITE_REQUEST_SUCCESS,
	SITE_REQUEST_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	NOTIFICATIONS_UNSEEN_COUNT_SET,
	SEND_TO_PRINTER,
} from '../../state/action-types';

import {
	NOTIFY_DESKTOP_CANNOT_USE_EDITOR,
	NOTIFY_DESKTOP_DID_REQUEST_SITE,
	NOTIFY_DESKTOP_DID_ACTIVATE_JETPACK_MODULE,
	NOTIFY_DESKTOP_NOTIFICATIONS_UNSEEN_COUNT_SET,
	NOTIFY_DESKTOP_SEND_TO_PRINTER,
	NOTIFY_DESKTOP_VIEW_POST_CLICKED,
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

			case EDITOR_VIEW_POST_CLICKED: {
				debug( 'Dispatching window event for action type: ', action.type );
				const { url } = action;
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_VIEW_POST_CLICKED, {
						detail: {
							url,
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

			case SEND_TO_PRINTER: {
				debug( 'Dispatching window event for action type: ', action.type );
				const { title, contents } = action;
				window.dispatchEvent(
					new window.CustomEvent( NOTIFY_DESKTOP_SEND_TO_PRINTER, {
						detail: {
							title,
							contents,
						},
					} )
				);
				return next( action );
			}

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
