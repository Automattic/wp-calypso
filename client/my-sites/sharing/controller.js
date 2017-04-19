/**
 * External Dependencies
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
import { getSelectedSite } from 'state/ui/selectors';
import { canCurrentUser } from 'state/selectors';
import { requestSiteSettings } from 'state/site-settings/actions';
import { isJetpackModuleActive, isJetpackMinimumVersion } from 'state/sites/selectors';

const analyticsPageTitle = 'Sharing';

export const layout = ( { contentComponent, path, store } ) => {
	const state = store.getState();
	const site = getSelectedSite( state );

	if ( site && ! site.settings && canCurrentUser( state, site.ID, 'manage_options' ) ) {
		// query component?
		requestSiteSettings( state, site.ID );
	}

	renderWithReduxStore(
		createElement( Sharing, { contentComponent, path } ),
		document.getElementById( 'primary' ),
		store
	);
};

export const connections = ( context, next ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const basePath = sectionify( context.path );
	const baseAnalyticsPath = site ? basePath + '/:site' : basePath;

	if ( site && ! canCurrentUser( state, site.ID, 'publish_posts' ) ) {
		notices.error( translate( 'You are not authorized to manage sharing settings for this site.' ) );
	}

	if ( site && site.jetpack && ! isJetpackModuleActive( state, site.ID, 'publicize' ) ) {
		// Redirect to sharing buttons if Jetpack Publicize module is not
		// active, but ShareDaddy is active
		page.redirect( isJetpackModuleActive( state, site.ID, 'sharedaddy' ) ? '/sharing/buttons/' + site.slug : '/stats' );
	} else {
		pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Connections' );

		context.contentComponent = createElement( SharingConnections );
	}

	next();
};

export const buttons = ( context, next ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const basePath = sectionify( context.path );
	const baseAnalyticsPath = site ? basePath + '/:site' : basePath;

	pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > Sharing Buttons' );

	if ( site && ! canCurrentUser( state, site.ID, 'manage_options' ) ) {
		notices.error( translate( 'You are not authorized to manage sharing settings for this site.' ) );
	}

	if ( site && site.jetpack &&
			! ( isJetpackModuleActive( state, site.ID, 'sharedaddy' ) || isJetpackMinimumVersion( state, site.ID, '3.4-dev' ) )
		) {
		notices.error(
			translate( 'This page is only available to Jetpack sites running version 3.4 or higher with the Sharing module activated.' )
		);
	}

	context.contentComponent = createElement( SharingButtons );

	next();
};
