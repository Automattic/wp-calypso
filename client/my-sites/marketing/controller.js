import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { createElement } from 'react';
import { navigate } from 'calypso/lib/navigate';
import SharingConnections from 'calypso/sites/marketing/connections/connections';
import SharingButtons from 'calypso/sites/marketing/sharing/buttons';
import MarketingTools from 'calypso/sites/marketing/tools';
import Traffic from 'calypso/sites/marketing/traffic/traffic';
import { errorNotice } from 'calypso/state/notices/actions';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { fetchPreferences } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import { setExpandedService } from 'calypso/state/sharing/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteSlug, isJetpackSite, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import JetpackSocial from './jetpack-social';
import Sharing from './main';

export const redirectConnections = ( context ) => {
	const serviceParam = context.params.service ? `?service=${ context.params.service }` : '';
	page.redirect( `/marketing/connections/${ context.params.domain }${ serviceParam }` );
};

export const redirectDefaultConnectionsDomain = async ( context ) => {
	const { getState, dispatch } = context.store;

	if ( ! hasReceivedRemotePreferences( getState() ) ) {
		await dispatch( fetchPreferences() );
	}
	const state = getState();

	const recentSiteId = getPreference( state, 'recentSites' )[ 0 ];

	let recentSiteSlug = getSiteSlug( state, recentSiteId );
	if ( ! recentSiteSlug ) {
		try {
			await dispatch( requestSite( recentSiteId ) );
		} catch {
			// proceed despite a failed site request
		}
		recentSiteSlug = getSiteSlug( getState(), recentSiteId );
		if ( ! recentSiteSlug ) {
			// TODO Maybe get the primary site slug, but for now redirect to site selection.
			page.redirect( '/marketing/connections' );
		}
	}
	context.params.domain = recentSiteSlug;
	redirectConnections( context );
};

export const redirectMarketingTools = ( context ) => {
	page.redirect( '/marketing/tools/' + context.params.domain );
};

export const redirectMarketingBusinessTools = ( context ) => {
	page.redirect( '/marketing/tools/' + context.params.domain );
};

export const redirectSharingButtons = ( context ) => {
	page.redirect( '/marketing/sharing-buttons/' + context.params.domain );
};

export const layout = ( context, next ) => {
	const { contentComponent, pathname } = context;

	context.primary = createElement( Sharing, { contentComponent, pathname } );

	next();
};

export const connections = ( context, next ) => {
	const { store } = context;
	const { dispatch } = store;
	dispatch( setExpandedService( context.query.service ) );

	const state = store.getState();
	const siteId = getSelectedSiteId( state );
	const isP2Hub = isSiteP2Hub( state, siteId );

	if ( siteId && ! canCurrentUser( state, siteId, 'publish_posts' ) ) {
		dispatch(
			errorNotice( translate( 'You are not authorized to manage sharing settings for this site.' ) )
		);
	}

	const siteSlug = getSiteSlug( state, siteId );

	context.contentComponent = createElement( SharingConnections, { isP2Hub, siteId, siteSlug } );

	next();
};

export const jetpackSocial = ( context, next ) => {
	context.contentComponent = createElement( JetpackSocial );

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
		store.dispatch(
			errorNotice( translate( 'You are not authorized to manage sharing settings for this site.' ) )
		);
	}

	const isJetpack = isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } );
	if ( ! isJetpack ) {
		return navigate( getSiteAdminUrl( state, siteId, 'options-general.php?page=sharing' ) );
	}

	context.contentComponent = createElement( SharingButtons );

	next();
};

export const traffic = ( context, next ) => {
	context.primary = createElement( Traffic );

	next();
};

export const activitypub = async ( { store } ) => {
	const state = store.getState();
	const siteId = getSelectedSiteId( state );

	if ( ! siteId ) {
		// Fallback to site selection if no site is selected.
		page.redirect( '/marketing/activitypub' );
	}

	if ( ! canCurrentUser( state, siteId, 'manage_options' ) ) {
		store.dispatch(
			errorNotice(
				translate( 'You are not authorized to manage ActivityPub settings for this site.' )
			)
		);
	}

	// For Jetpack/Atomic sites, check if ActivityPub plugin is installed.
	if ( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } ) ) {
		// Always fetch plugins first to ensure we have fresh data.
		await store.dispatch( fetchSitePlugins( siteId ) );

		const updatedState = store.getState();

		if ( ! getPluginOnSite( updatedState, siteId, 'activitypub' ) ) {
			// Plugin not installed, redirect to plugin installation with search term.
			return navigate(
				getSiteAdminUrl(
					updatedState,
					siteId,
					'plugin-install.php?s=activitypub&tab=search&type=term'
				)
			);
		}
	}

	return navigate( getSiteAdminUrl( state, siteId, 'options-general.php?page=activitypub' ) );
};
