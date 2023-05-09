import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from 'calypso/lib/url';
import { ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import { receiveAdminMenu } from 'calypso/state/admin-menu/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';

export const requestFetchAdminMenu = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

const sanitizeUrl = ( url, wpAdminUrl ) => {
	const isSafeInternalUrl = new RegExp( '^/' ).test( url );
	// The replace function removes the protocol.
	const isSafeWpAdminUrl = new RegExp( `^${ wpAdminUrl?.replace( /^https?:\/\//, '' ) }` ).test(
		url?.replace( /^https?:\/\//, '' )
	);

	// Gives WP Admin Customizer a chance to return to where we started from.
	if ( isSafeWpAdminUrl && url.includes( 'wp-admin/customize.php' ) ) {
		url = addQueryArgs(
			{
				return: document.location.href,
			},
			url
		);
	}

	if ( isSafeInternalUrl || isSafeWpAdminUrl ) {
		return url;
	}

	return '';
};

const sanitizeMenuItem = ( menuItem, siteSlug, wpAdminUrl ) => {
	if ( ! menuItem ) {
		return menuItem;
	}

	let sanitizedChildren;
	if ( Array.isArray( menuItem.children ) ) {
		sanitizedChildren = menuItem.children.map( ( subMenuItem ) =>
			sanitizeMenuItem( subMenuItem, siteSlug, wpAdminUrl )
		);
	}

	// Enable the import page if the feature option is on.
	if ( menuItem.slug === 'import-php' && isEnabled( 'importer/unified' ) ) {
		menuItem.url = `/import/${ siteSlug }`;
	}

	return {
		...menuItem,
		url: sanitizeUrl( menuItem.url, wpAdminUrl ),
		...( sanitizedChildren ? { children: sanitizedChildren } : {} ),
	};
};

export const handleSuccess =
	( { siteId }, menuData ) =>
	( dispatch, getState ) => {
		if ( ! Array.isArray( menuData ) ) {
			return dispatch( receiveAdminMenu( siteId, menuData ) );
		}

		// Sanitize menu data.
		const state = getState();
		const wpAdminUrl = getSiteAdminUrl( state, siteId );
		const siteSlug = getSiteSlug( state, siteId );

		return dispatch(
			receiveAdminMenu(
				siteId,
				menuData.map( ( menuItem ) => sanitizeMenuItem( menuItem, siteSlug, wpAdminUrl ) )
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
