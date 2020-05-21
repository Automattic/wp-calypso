/**
 * Internal dependencies
 */
import {
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE,
} from '../../state/action-types';

/**
 * Middleware
 */

export const navigationMiddleware = () => {
	return ( next ) => ( action ) => {
		switch ( action.type ) {
			case JETPACK_MODULE_ACTIVATE_SUCCESS:
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
				window.dispatchEvent(
					new window.CustomEvent( 'desktop-notify-site-request-status', {
						detail: {
							status: 'error',
							siteId: action.siteId,
						},
					} )
				);
				return next( action );

			default:
				return next( action );
		}
	};
};
