import { addQueryArgs } from 'calypso/lib/url';
import { ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import { receiveAdminMenu } from 'calypso/state/admin-menu/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { getSiteAdminUrl, getSiteUrl } from 'calypso/state/sites/selectors';

export const requestFetchAdminMenu = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const sanitizeUrl = ( url, wpAdminUrl, siteUrl ) => {
	const isSafeInternalUrl = new RegExp( '^/' ).test( url );
	// The replace function removes the protocol.
	const isSafeWpAdminUrl = new RegExp( `^${ wpAdminUrl?.replace( /^https?:\/\//, '' ) }` ).test(
		url?.replace( /^https?:\/\//, '' )
	);
	const isSafeJetpackRedirectUrl =
		new RegExp( '^https://jetpack.com/redirect/' ).test( url ) &&
		url?.includes( `site=${ siteUrl.replace( /^https?:\/\//, '' ) }` );

	if ( isSafeWpAdminUrl ) {
		url = addQueryArgs(
			{
				return: document.location.href, // Gives WP Admin a chance to return to where we started from.
			},
			url
		);
	}

	if ( isSafeInternalUrl || isSafeWpAdminUrl || isSafeJetpackRedirectUrl ) {
		return url;
	}

	return '';
};

const sanitizeMenuItem = ( menuItem, wpAdminUrl, siteUrl ) => {
	if ( ! menuItem ) {
		return menuItem;
	}

	let sanitizedChildren;
	if ( Array.isArray( menuItem.children ) ) {
		sanitizedChildren = menuItem.children.map( ( subMenuItem ) =>
			sanitizeMenuItem( subMenuItem, wpAdminUrl, siteUrl )
		);
	}

	return {
		...menuItem,
		url: sanitizeUrl( menuItem.url, wpAdminUrl, siteUrl ),
		...( sanitizedChildren ? { children: sanitizedChildren } : {} ),
	};
};

export const handleSuccess = ( { siteId }, menuData ) => ( dispatch, getState ) => {
	if ( ! Array.isArray( menuData ) ) {
		return dispatch( receiveAdminMenu( siteId, menuData ) );
	}

	// Sanitize menu data.
	const siteUrl = getSiteUrl( getState(), siteId );
	const wpAdminUrl = getSiteAdminUrl( getState(), siteId );
	return dispatch(
		receiveAdminMenu(
			siteId,
			menuData.map( ( menuItem ) => sanitizeMenuItem( menuItem, wpAdminUrl, siteUrl ) )
		)
	);
};

export const handleError = () => {
	return null;
};

registerHandlers( 'state/data-layer/wpcom/admin-menu/index.js', {
	[ ADMIN_MENU_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFetchAdminMenu,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );
