/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	DESKTOP_NOTIFY_CANNOT_OPEN_EDITOR,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE,
} from '../../state/action-types';

/**
 * Module variables
 */
const debug = debugFactory( 'desktop:middleware' );

/**
 * Middleware
 */
export const desktopMiddleware = () => {
	return ( next ) => ( action ) => {
		switch ( action.type ) {
			case DESKTOP_NOTIFY_CANNOT_OPEN_EDITOR: {
				debug( 'Dispatching window event for action type: ', action.type );
				const { site, reason, wpAdminLoginUrl } = action;
				window.dispatchEvent(
					new window.CustomEvent( 'desktop-notify-cannot-open-editor', {
						detail: {
							site,
							reason,
							wpAdminLoginUrl,
						},
					} )
				);
				return next( action );
			}

			case JETPACK_MODULE_ACTIVATE_SUCCESS:
				debug( 'Dispatching window event for action type: ', action.type );
				window.dispatchEvent(
					new window.CustomEvent( 'desktop-notify-jetpack-module-activate-status', {
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
					new window.CustomEvent( 'desktop-notify-jetpack-module-activate-status', {
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
					new window.CustomEvent( 'desktop-notify-site-request-status', {
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
					new window.CustomEvent( 'desktop-notify-site-request-status', {
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
