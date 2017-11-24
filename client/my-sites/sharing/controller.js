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
import { renderWithReduxStore } from 'lib/react-helpers';
import { sectionify } from 'lib/route';
import Sharing from './main';
import SharingButtons from './buttons/buttons';
import SharingConnections from './connections/connections';
import sites from 'lib/sites-list';
import utils from 'lib/site/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { canCurrentUser, isJetpackModuleActive } from 'state/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import { requestSiteSettings } from 'state/site-settings/actions';
import { reduxDispatch } from 'lib/redux-bridge/index';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';

const analyticsPageTitle = 'Sharing';

export const layout = context => {
	const { contentComponent, path, store } = context;
	const state = store.getState();

	const siteId = getSelectedSiteId( state );
	const siteSettings = getSiteSettings( state, siteId );

	if ( siteId && ! siteSettings && canCurrentUser( state, siteId, 'manage_options' ) ) {
		reduxDispatch( requestSiteSettings( siteId ) );
	}

	renderWithReduxStore(
		createElement( Sharing, { contentComponent, path } ),
		document.getElementById( 'primary' ),
		store
	);
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
	const site = sites().getSelectedSite();
	const basePath = sectionify( context.path );
	const baseAnalyticsPath = site ? basePath + '/:site' : basePath;

	pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Sharing Buttons' );

	if ( site && ! utils.userCan( 'manage_options', site ) ) {
		notices.error(
			translate( 'You are not authorized to manage sharing settings for this site.' )
		);
	}

	if (
		site &&
		site.jetpack &&
		( ! site.isModuleActive( 'sharedaddy' ) || site.versionCompare( '3.4-dev', '<' ) )
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
