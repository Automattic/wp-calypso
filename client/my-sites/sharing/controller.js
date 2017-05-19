/**
 * External Dependencies
 */
import { createElement } from 'react';
import page from 'page';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	isJetpackModuleActive,
	isJetpackSite,
} from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import notices from 'notices';
import { pageView } from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import { sectionify } from 'lib/route';
import Sharing from './main';
import SharingButtons from './buttons/buttons';
import SharingConnections from './connections/connections';
import sites from 'lib/sites-list';
import utils from 'lib/site/utils';

const analyticsPageTitle = 'Sharing';

export const layout = ( { contentComponent, path, store } ) => {
	const site = sites().getSelectedSite();

	if ( site && ! site.settings && utils.userCan( 'manage_options', site ) ) {
		site.fetchSettings();
	}

	renderWithReduxStore(
		createElement( Sharing, { contentComponent, path } ),
		document.getElementById( 'primary' ),
		store
	);
};

export const connections = ( context, next ) => {
	const site = sites().getSelectedSite();
	const basePath = sectionify( context.path );
	const baseAnalyticsPath = site ? basePath + '/:site' : basePath;

	if ( site && ! utils.userCan( 'publish_posts', site ) ) {
		notices.error( translate( 'You are not authorized to manage sharing settings for this site.' ) );
	}

	if ( site && site.jetpack && ! site.isModuleActive( 'publicize' ) ) {
		// Redirect to sharing buttons if Jetpack Publicize module is not
		// active, but ShareDaddy is active
		page.redirect( site.isModuleActive( 'sharedaddy' ) ? '/sharing/buttons/' + sites.selected : '/stats' );
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
		notices.error( translate( 'You are not authorized to manage sharing settings for this site.' ) );
	}

	if ( site && site.jetpack && ( ! site.isModuleActive( 'sharedaddy' ) || site.versionCompare( '3.4-dev', '<' ) ) ) {
		notices.error( translate( 'This page is only available to Jetpack sites running version 3.4 or higher with the Sharing module activated.' ) );
	}

	context.contentComponent = createElement( SharingButtons );

	next();
};

export const jetpackModuleActive = ( moduleId, redirect ) => {
	return function( context, next ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const isModuleActive = isJetpackModuleActive(
			state,
			siteId,
			moduleId );

		if ( ! isJetpack ) {
			return next();
		}

		if ( isModuleActive || false === redirect ) {
			next();
		} else {
			page.redirect( 'string' === typeof redirect ? redirect : '/stats' );
		}
	};
};
