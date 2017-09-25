/** @format */
/**
 * External dependencies
 */
import Debug from 'debug';
import { translate } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import JetpackConnectAuthorizeForm from './authorize-form';
import JetpackNewSite from './jetpack-new-site/index';
import JetpackConnect from './main';
import Plans from './plans';
import PlansLanding from './plans-landing';
import jetpackSSOForm from './sso';
import CheckoutData from 'components/data/checkout';
import analytics from 'lib/analytics';
import i18nUtils from 'lib/i18n-utils';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import userFactory from 'lib/user';
import { JETPACK_CONNECT_QUERY_SET } from 'state/action-types';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { setSection } from 'state/ui/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const userModule = userFactory();
const analyticsPageTitleByType = {
	install: 'Jetpack Install',
	personal: 'Jetpack Connect Personal',
	premium: 'Jetpack Connect Premium',
	pro: 'Jetpack Install Pro',
};

const removeSidebar = context => {
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

	context.store.dispatch(
		setSection(
			{ name: 'jetpackConnect' },
			{
				hasSidebar: false,
			}
		)
	);
};

const jetpackNewSiteSelector = context => {
	removeSidebar( context );
	renderWithReduxStore(
		React.createElement( JetpackNewSite, {
			path: context.path,
			context: context,
			locale: context.params.locale,
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
};

export default {
	redirectWithoutLocaleifLoggedIn( context, next ) {
		if ( userModule.get() && i18nUtils.getLocaleFromPath( context.path ) ) {
			const urlWithoutLocale = i18nUtils.removeLocaleFromPath( context.path );
			debug( 'redirectWithoutLocaleifLoggedIn to %s', urlWithoutLocale );
			return page.redirect( urlWithoutLocale );
		}

		next();
	},

	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) && context.query.redirect_uri ) {
			debug( 'set initial query object', context.query );
			context.store.dispatch( {
				type: JETPACK_CONNECT_QUERY_SET,
				queryObject: context.query,
			} );
			page.redirect( context.pathname );
		}

		next();
	},

	newSite( context ) {
		analytics.pageView.record( '/jetpack/new', 'Add a new site (Jetpack)' );
		jetpackNewSiteSelector( context );
	},

	connect( context ) {
		const { path, pathname, params } = context;
		const { type = false } = params;
		const analyticsPageTitle = get( type, analyticsPageTitleByType, 'Jetpack Connect' );

		debug( 'entered connect flow with params %o', params );

		analytics.pageView.record( pathname, analyticsPageTitle );

		removeSidebar( context );

		userModule.fetch();

		renderWithReduxStore(
			React.createElement( JetpackConnect, {
				context,
				locale: context.params.locale,
				path,
				type,
				url: context.query.url,
				userModule,
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	authorizeForm( context ) {
		const analyticsBasePath = 'jetpack/connect/authorize',
			analyticsPageTitle = 'Jetpack Authorize';

		removeSidebar( context );

		let interval = context.params.interval;
		let locale = context.params.locale;
		if ( context.params.localeOrInterval ) {
			if ( [ 'monthly', 'yearly' ].indexOf( context.params.localeOrInterval ) >= 0 ) {
				interval = context.params.localeOrInterval;
			} else {
				locale = context.params.localeOrInterval;
			}
		}

		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );
		renderWithReduxStore(
			<JetpackConnectAuthorizeForm path={ context.path } interval={ interval } locale={ locale } />,
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
				ssoNonce: context.params.ssoNonce,
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	plansLanding( context ) {
		const analyticsPageTitle = 'Plans';
		const basePath = route.sectionify( context.path );
		const analyticsBasePath = basePath + '/:site';

		removeSidebar( context );

		context.store.dispatch( setTitle( translate( 'Plans', { textOnly: true } ) ) );

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			<PlansLanding
				context={ context }
				destinationType={ context.params.destinationType }
				interval={ context.params.interval }
				basePlansPath={ '/jetpack/connect/store' }
				url={ context.query.site }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	plansSelection( context ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const analyticsPageTitle = 'Plans';
		const basePath = route.sectionify( context.path );
		const analyticsBasePath = basePath + '/:site';

		if ( ! isJetpack ) {
			return;
		}

		removeSidebar( context );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( translate( 'Plans', { textOnly: true } ) ) );

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			<CheckoutData>
				<Plans
					context={ context }
					destinationType={ context.params.destinationType }
					basePlansPath={ '/jetpack/connect/plans' }
					interval={ context.params.interval }
				/>
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	plansPreSelection( context ) {
		const analyticsPageTitle = 'Plans';
		const basePath = route.sectionify( context.path );
		const analyticsBasePath = basePath + '/:site';

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			<Plans
				context={ context }
				showFirst={ true }
				destinationType={ context.params.destinationType }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
