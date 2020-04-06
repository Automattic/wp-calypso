/**
 * External dependencies
 */
import { createElement } from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import MarketingTools from './tools';
import notices from 'notices';
import Sharing from './main';
import SharingButtons from './buttons/buttons';
import SharingConnections from './connections/connections';
import Traffic from './traffic/';
import { getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { isJetpackSite, isJetpackModuleActive, getSiteOption } from 'state/sites/selectors';
import versionCompare from 'lib/version-compare';

export const redirectConnections = context => {
	page.redirect( '/marketing/connections/' + context.params.domain );
};

export const redirectMarketingTools = context => {
	page.redirect( '/marketing/tools/' + context.params.domain );
};

export const redirectSharingButtons = context => {
	page.redirect( '/marketing/sharing-buttons/' + context.params.domain );
};

export const layout = ( context, next ) => {
	const { contentComponent, path } = context;

	context.primary = createElement( Sharing, { contentComponent, path } );

	next();
};

export const connections = ( context, next ) => {
	const { store } = context;
	const state = store.getState();
	const siteId = getSelectedSiteId( state );

	if ( siteId && ! canCurrentUser( state, siteId, 'publish_posts' ) ) {
		notices.error(
			translate( 'You are not authorized to manage sharing settings for this site.' )
		);
	}

	context.contentComponent = createElement( SharingConnections );

	next();
};

export const marketingTools = ( context, next ) => {
	context.contentComponent = createElement( MarketingTools );

	next();
};

export const sharingButtons = ( context, next ) => {
	const { store } = context;
	const state = store.getState();
	const siteId = getSelectedSiteId( state );

	if ( siteId && ! canCurrentUser( state, siteId, 'manage_options' ) ) {
		notices.error(
			translate( 'You are not authorized to manage sharing settings for this site.' )
		);
	}

	const siteJetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );

	if (
		siteId &&
		isJetpackSite( state, siteId ) &&
		( ! isJetpackModuleActive( state, siteId, 'sharedaddy' ) ||
			versionCompare( siteJetpackVersion, '3.4-dev', '<' ) )
	) {
		notices.error(
			translate(
				'This page is only available to Jetpack sites running version 3.4 or higher with the Sharing module activated.'
			)
		);
	}

	context.contentComponent = createElement( SharingButtons );

	next();
};

export const traffic = ( context, next ) => {
	context.contentComponent = createElement( Traffic );

	next();
};
