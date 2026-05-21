import { addQueryArgs } from 'calypso/lib/url';
import { ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import { receiveAdminMenu } from 'calypso/state/admin-menu/actions';
import { receiveAdminSidebarLayout } from 'calypso/state/admin-sidebar/layout/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';

export const requestFetchAdminMenu = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-menu/?_locale=user`,
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

	const isSafeJetpackRedirectUrl = /^https:\/\/jetpack\.com\/redirect\//.test( url );

	// Gives WP Admin Customizer a chance to return to where we started from.
	if ( isSafeWpAdminUrl && url?.includes( 'wp-admin/customize.php' ) ) {
		url = addQueryArgs(
			{
				return: document.location.href,
			},
			url
		);
	}

	if ( isSafeInternalUrl || isSafeWpAdminUrl || isSafeJetpackRedirectUrl ) {
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

	return {
		...menuItem,
		url: sanitizeUrl( menuItem.url, wpAdminUrl ),
		...( sanitizedChildren ? { children: sanitizedChildren } : {} ),
	};
};

export const handleSuccess =
	( { siteId }, menuData ) =>
	( dispatch, getState ) => {
		const hasRedesignedEnvelope =
			menuData && ! Array.isArray( menuData ) && Array.isArray( menuData.menu );
		const rawMenuItems = hasRedesignedEnvelope ? menuData.menu : menuData;
		const groups = hasRedesignedEnvelope && Array.isArray( menuData.groups ) ? menuData.groups : [];
		const layoutDelta =
			hasRedesignedEnvelope &&
			menuData.layoutDelta &&
			Array.isArray( menuData.layoutDelta.overrides )
				? menuData.layoutDelta
				: null;

		if ( layoutDelta ) {
			dispatch( receiveAdminSidebarLayout( siteId, layoutDelta ) );
		}

		if ( ! Array.isArray( rawMenuItems ) ) {
			return dispatch( receiveAdminMenu( siteId, rawMenuItems, groups ) );
		}

		// Sanitize menu data.
		const state = getState();
		const wpAdminUrl = getSiteAdminUrl( state, siteId );
		const siteSlug = getSiteSlug( state, siteId );

		return dispatch(
			receiveAdminMenu(
				siteId,
				rawMenuItems.map( ( menuItem ) => sanitizeMenuItem( menuItem, siteSlug, wpAdminUrl ) ),
				groups
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
