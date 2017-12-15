/** @format */

/**
 * External dependencies
 */

import { createElement } from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import notices from 'notices';
import { pageView } from 'lib/analytics';
import { sectionify } from 'lib/route';
import Sharing from './main';
import SharingButtons from './buttons/buttons';
import SharingConnections from './connections/connections';
import { getSelectedSiteId } from 'state/ui/selectors';
import { canCurrentUser } from 'state/selectors';
import {
	isJetpackSite,
	isJetpackModuleActive,
	getSiteSlug,
	getSiteOption,
} from 'state/sites/selectors';
import versionCompare from 'lib/version-compare';

const analyticsPageTitle = 'Sharing';

export const layout = ( context, next ) => {
	const { contentComponent, path } = context;

	context.primary = createElement( Sharing, { contentComponent, path } );
	next();
};

export const connections = ( context, next ) => {
	const { store, path } = context;
	const state = store.getState();

	const siteId = getSelectedSiteId( state );

	const basePath = sectionify( path );
	const baseAnalyticsPath = siteId ? basePath + '/:site' : basePath;

	if ( siteId && ! canCurrentUser( state, siteId, 'publish_posts' ) ) {
		notices.error(
			translate( 'You are not authorized to manage sharing settings for this site.' )
		);
	}

	if (
		siteId &&
		isJetpackSite( state, siteId ) &&
		! isJetpackModuleActive( state, siteId, 'publicize' )
	) {
		const siteSlug = getSiteSlug( state, siteId );

		// Redirect to sharing buttons if Jetpack Publicize module is not
		// active, but ShareDaddy is active
		page.redirect(
			isJetpackModuleActive( state, siteId, 'sharedaddy' )
				? `/sharing/buttons/${ siteSlug }`
				: '/stats'
		);
	} else {
		pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Connections' );

		context.contentComponent = createElement( SharingConnections );
	}

	next();
};

export const buttons = ( context, next ) => {
	const { store, path } = context;
	const state = store.getState();

	const siteId = getSelectedSiteId( state );

	const basePath = sectionify( path );
	const baseAnalyticsPath = siteId ? basePath + '/:site' : basePath;

	pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Sharing Buttons' );

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
