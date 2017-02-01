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
import JetpackConnectAuthorizeForm from './authorize-form';
import { setSection } from 'state/ui/actions';
import { renderPage } from 'lib/react-helpers';
import { JETPACK_CONNECT_QUERY_SET } from 'state/action-types';
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

	renderPage(
		React.createElement( JetpackConnect, {
			path: context.path,
			context: context,
			type: type,
			userModule: userModule,
			locale: context.params.locale
		} ),
		context
	);
};

const getPlansLandingPage = ( context, hideFreePlan, path, landingType ) => {
	const PlansLanding = require( './plans-landing' ),
		analyticsPageTitle = 'Plans',
		basePath = route.sectionify( context.path ),
		analyticsBasePath = basePath + '/:site';

	removeSidebar( context );

	context.store.dispatch( setTitle( i18n.translate( 'Plans', { textOnly: true } ) ) );

	analytics.tracks.recordEvent( 'calypso_plans_view' );
	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	renderPage(
		<PlansLanding
			context={ context }
			destinationType={ context.params.destinationType }
			intervalType={ context.params.intervalType }
			isLanding={ true }
			landingType={ landingType }
			basePlansPath={ path }
			hideFreePlan={ hideFreePlan } />,
		context
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

		next();
	},

	personal( context ) {
		const analyticsBasePath = '/jetpack/connect/personal',
			analyticsPageTitle = 'Jetpack Connect Personal';

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		jetpackConnectFirstStep( context, 'personal' );
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

		let intervalType = context.params.intervalType;
		let locale = context.params.locale;
		if ( context.params.localeOrInterval ) {
			if ( [ 'monthly', 'yearly' ].indexOf( context.params.localeOrInterval ) >= 0 ) {
				intervalType = context.params.localeOrInterval;
			} else {
				locale = context.params.localeOrInterval;
			}
		}

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );
		renderPage(
			<JetpackConnectAuthorizeForm
				path={ context.path }
				intervalType={ intervalType }
				locale={ locale }
				userModule={ userModule } />,
			context
		);
	},

	sso( context ) {
		const analyticsBasePath = '/jetpack/sso',
			analyticsPageTitle = 'Jetpack SSO';

		removeSidebar( context );

		userModule.fetch();

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderPage(
			React.createElement( jetpackSSOForm, {
				path: context.path,
				locale: context.params.locale,
				userModule: userModule,
				siteId: context.params.siteId,
				ssoNonce: context.params.ssoNonce
			} ),
			context
		);
	},

	vaultpressLanding( context ) {
		getPlansLandingPage( context, true, '/jetpack/connect/vaultpress', 'vaultpress' );
	},

	akismetLanding( context ) {
		getPlansLandingPage( context, true, '/jetpack/connect/akismet', 'akismet' );
	},

	plansLanding( context ) {
		getPlansLandingPage( context, false, '/jetpack/connect/store', 'jetpack' );
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

		renderPage(
			<CheckoutData>
				<Plans
					context={ context }
					destinationType={ context.params.destinationType }
					basePlansPath={ '/jetpack/connect/plans' }
					intervalType={ context.params.intervalType } />
			</CheckoutData>,
			context
		);
	},

	plansPreSelection( context ) {
		const Plans = require( './plans' ),
			analyticsPageTitle = 'Plans',
			basePath = route.sectionify( context.path ),
			analyticsBasePath = basePath + '/:site';

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderPage(
			<Plans
				context={ context }
				showFirst={ true }
				destinationType={ context.params.destinationType } />,
			context
		);
	},
};
