/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import page from 'page';
import Debug from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import JetpackConnect from './index';
import jetpackConnectAuthorizeForm from './authorize-form';
import { setSection } from 'state/ui/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import {
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_QUERY_UPDATE
} from 'state/action-types';
import userFactory from 'lib/user';
import jetpackSSOForm from './sso';
import i18nUtils from 'lib/i18n-utils';
import analytics from 'lib/analytics';
import config from 'config';
import route from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const userModule = userFactory();

const removeSidebar = ( context ) => {
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

	context.store.dispatch( setSection( { name: 'jetpackConnect' }, {
		hasSidebar: false
	} ) );
};

const jetpackConnectFirstStep = ( context, type ) => {
	removeSidebar( context );

	userModule.fetch();

	renderWithReduxStore(
		React.createElement( JetpackConnect, {
			path: context.path,
			context: context,
			type: type,
			userModule: userModule,
			locale: context.params.locale
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
};

const getPlansLandingPage = ( context, hideFreePlan ) => {
	const PlansLanding = require( './plans-landing' ),
		analyticsPageTitle = 'Plans',
		basePath = route.sectionify( context.path ),
		analyticsBasePath = basePath + '/:site';

	removeSidebar( context );

	context.store.dispatch( setTitle( i18n.translate( 'Plans', { textOnly: true } ) ) );

	analytics.tracks.recordEvent( 'calypso_plans_view' );
	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	renderWithReduxStore(
		<PlansLanding
			context={ context }
			destinationType={ context.params.destinationType }
			intervalType={ context.params.intervalType }
			isLanding={ true }
			hideFreePlan={ hideFreePlan } />,
		document.getElementById( 'primary' ),
		context.store
	);
};

export default {
	redirectWithoutLocaleifLoggedIn( context, next ) {
		if ( userModule.get() && i18nUtils.getLocaleFromPath( context.path ) ) {
			const urlWithoutLocale = i18nUtils.removeLocaleFromPath( context.path );
			return page.redirect( urlWithoutLocale );
		}

		next();
	},

	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) && context.query.redirect_uri ) {
			debug( 'set initial query object', context.query );
			context.store.dispatch( {
				type: JETPACK_CONNECT_QUERY_SET,
				queryObject: context.query
			} );
			page.redirect( context.pathname );
		}

		if ( ! isEmpty( context.query ) && context.query.update_nonce ) {
			debug( 'updating nonce', context.query );
			context.store.dispatch( {
				type: JETPACK_CONNECT_QUERY_UPDATE,
				property: '_wp_nonce',
				value: context.query.update_nonce
			} );
			page.redirect( context.pathname );
		}

		next();
	},

	premium( context ) {
		const analyticsBasePath = '/jetpack/connect/premium',
			analyticsPageTitle = 'Jetpack Connect Premium';

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		jetpackConnectFirstStep( context, 'premium' );
	},

	pro( context ) {
		const analyticsBasePath = '/jetpack/connect/pro',
			analyticsPageTitle = 'Jetpack Install Pro';

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		jetpackConnectFirstStep( context, 'pro' );
	},

	install( context ) {
		const analyticsBasePath = '/jetpack/connect/install',
			analyticsPageTitle = 'Jetpack Install';

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		jetpackConnectFirstStep( context, 'install' );
	},

	connect( context ) {
		const analyticsBasePath = '/jetpack/connect',
			analyticsPageTitle = 'Jetpack Connect';

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		jetpackConnectFirstStep( context, false );
	},

	authorizeForm( context ) {
		const analyticsBasePath = 'jetpack/connect/authorize',
			analyticsPageTitle = 'Jetpack Authorize';

		removeSidebar( context );

		userModule.fetch();

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			React.createElement( jetpackConnectAuthorizeForm, {
				path: context.path,
				locale: context.params.locale,
				userModule: userModule
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	sso( context ) {
		const analyticsBasePath = '/jetpack/sso',
			analyticsPageTitle = 'Jetpack SSO';

		removeSidebar( context );

		userModule.fetch();

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			React.createElement( jetpackSSOForm, {
				path: context.path,
				locale: context.params.locale,
				userModule: userModule,
				siteId: context.params.siteId,
				ssoNonce: context.params.ssoNonce
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	vaultpressLanding( context ) {
		getPlansLandingPage( context, true );
	},

	akismetLanding( context ) {
		getPlansLandingPage( context, false );
	},

	plansLanding( context ) {
		getPlansLandingPage( context, false );
	},

	plansSelection( context ) {
		const Plans = require( './plans' ),
			CheckoutData = require( 'components/data/checkout' ),
			state = context.store.getState(),
			siteId = getSelectedSiteId( state ),
			isJetpack = isJetpackSite( state, siteId ),
			analyticsPageTitle = 'Plans',
			basePath = route.sectionify( context.path ),
			analyticsBasePath = basePath + '/:site';

		if ( ! config.isEnabled( 'jetpack/connect' ) || ! isJetpack ) {
			return;
		}

		removeSidebar( context );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Plans', { textOnly: true } ) ) );

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			<CheckoutData>
				<Plans
					context={ context }
					destinationType={ context.params.destinationType }
					intervalType={ context.params.intervalType } />
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	plansPreSelection( context ) {
		const Plans = require( './plans' ),
			analyticsPageTitle = 'Plans',
			basePath = route.sectionify( context.path ),
			analyticsBasePath = basePath + '/:site';

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			<Plans
				context={ context }
				showFirst={ true }
				destinationType={ context.params.destinationType } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
