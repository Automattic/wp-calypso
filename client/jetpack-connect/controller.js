/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import Debug from 'debug';
import page from 'page';
import validator from 'is-my-json-valid';
import { get, isEmpty, some } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import CheckoutData from 'components/data/checkout';
import config from 'config';
import { getLocaleFromPath, removeLocaleFromPath } from 'lib/i18n-utils';
import JetpackAuthorize from './authorize';
import JetpackConnect from './main';
import JetpackNewSite from './jetpack-new-site/index';
import JetpackSignup from './signup';
import JetpackSsoForm from './sso';
import NoDirectAccessError from './no-direct-access-error';
import Plans from './plans';
import PlansLanding from './plans-landing';
import route from 'lib/route';
import userFactory from 'lib/user';
import { authorizeQueryDataSchema } from './schema';
import { authQueryTransformer } from './utils';
import { JETPACK_CONNECT_QUERY_SET } from 'state/action-types';
import { MOBILE_APP_REDIRECT_URL_WHITELIST } from './constants';
import { receiveJetpackOnboardingCredentials } from 'state/jetpack-onboarding/actions';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import { persistMobileRedirect, storePlan } from './persistence-utils';
import { urlToSlug } from 'lib/url';
import {
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

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
	context.primary = React.createElement( JetpackNewSite, {
		path: context.path,
		context: context,
		locale: context.params.locale,
	} );
};

const getPlanSlugFromFlowType = ( type, interval = 'yearly' ) => {
	const planSlugs = {
		yearly: {
			personal: PLAN_JETPACK_PERSONAL,
			premium: PLAN_JETPACK_PREMIUM,
			pro: PLAN_JETPACK_BUSINESS,
		},
		monthly: {
			personal: PLAN_JETPACK_PERSONAL_MONTHLY,
			premium: PLAN_JETPACK_PREMIUM_MONTHLY,
			pro: PLAN_JETPACK_BUSINESS_MONTHLY,
		},
	};

	return get( planSlugs, [ interval, type ], '' );
};

export function redirectWithoutLocaleIfLoggedIn( context, next ) {
	if ( userModule.get() && getLocaleFromPath( context.path ) ) {
		const urlWithoutLocale = removeLocaleFromPath( context.path );
		debug( 'redirectWithoutLocaleIfLoggedIn to %s', urlWithoutLocale );
		return page.redirect( urlWithoutLocale );
	}

	next();
}

export function maybeOnboard( { query, store }, next ) {
	if ( ! isEmpty( query ) && query.onboarding ) {
		const siteId = parseInt( query.client_id, 10 );
		const siteSlug = urlToSlug( query.site_url );
		const credentials = {
			token: query.onboarding,
			siteUrl: query.site_url,
			userEmail: query.user_email,
		};

		store.dispatch( receiveJetpackOnboardingCredentials( siteId, credentials ) );

		return page.redirect( '/jetpack/onboarding/' + siteSlug );
	}

	next();
}

export function newSite( context, next ) {
	analytics.pageView.record( '/jetpack/new', 'Add a new site (Jetpack)' );
	jetpackNewSiteSelector( context );
	next();
}

export function connect( context, next ) {
	const { path, pathname, params, query } = context;
	const { type = false, interval } = params;
	const analyticsPageTitle = get( type, analyticsPageTitleByType, 'Jetpack Connect' );

	debug( 'entered connect flow with params %o', params );

	const planSlug = getPlanSlugFromFlowType( type, interval );
	planSlug && storePlan( planSlug );

	if ( config.isEnabled( 'jetpack/connect/mobile-app-flow' ) ) {
		if (
			some( MOBILE_APP_REDIRECT_URL_WHITELIST, pattern => pattern.test( query.mobile_redirect ) )
		) {
			debug( `In mobile app flow with redirect url: ${ query.mobile_redirect }` );
			persistMobileRedirect( query.mobile_redirect );
		} else {
			persistMobileRedirect( '' );
		}
	}

	analytics.pageView.record( pathname, analyticsPageTitle );

	removeSidebar( context );

	userModule.fetch();

	context.primary = React.createElement( JetpackConnect, {
		context,
		locale: params.locale,
		path,
		type,
		url: query.url,
		userModule,
	} );
	next();
}

export function signupForm( context, next ) {
	analytics.pageView.record( 'jetpack/connect/authorize', 'Jetpack Authorize' );

	removeSidebar( context );

	const { query } = context;
	const validQueryObject = validator( authorizeQueryDataSchema )( query );

	if ( validQueryObject ) {
		const transformedQuery = authQueryTransformer( query );

		// No longer setting/persisting query
		//
		// FIXME
		//
		// However, from and clientId are required for some reducer logic :(
		//
		// Hopefully when actions move to data-layer, this will become clearer and
		// we won't need to store clientId in state
		//
		context.store.dispatch( {
			type: JETPACK_CONNECT_QUERY_SET,
			from: transformedQuery.from,
			clientId: transformedQuery.clientId,
		} );

		let interval = context.params.interval;
		let locale = context.params.locale;
		if ( context.params.localeOrInterval ) {
			if ( [ 'monthly', 'yearly' ].indexOf( context.params.localeOrInterval ) >= 0 ) {
				interval = context.params.localeOrInterval;
			} else {
				locale = context.params.localeOrInterval;
			}
		}
		context.primary = (
			<JetpackSignup
				path={ context.path }
				interval={ interval }
				locale={ locale }
				authQuery={ transformedQuery }
			/>
		);
	} else {
		context.primary = <NoDirectAccessError />;
	}
	next();
}

export function authorizeForm( context, next ) {
	analytics.pageView.record( 'jetpack/connect/authorize', 'Jetpack Authorize' );

	removeSidebar( context );

	const { query } = context;
	const validQueryObject = validator( authorizeQueryDataSchema )( query );

	if ( validQueryObject ) {
		const transformedQuery = authQueryTransformer( query );

		// No longer setting/persisting query
		//
		// FIXME
		//
		// However, from and clientId are required for some reducer logic :(
		//
		// Hopefully when actions move to data-layer, this will become clearer and
		// we won't need to store clientId in state
		//
		context.store.dispatch( {
			type: JETPACK_CONNECT_QUERY_SET,
			from: transformedQuery.from,
			clientId: transformedQuery.clientId,
		} );

		context.primary = <JetpackAuthorize authQuery={ transformedQuery } />;
	} else {
		context.primary = <NoDirectAccessError />;
	}
	next();
}

export function sso( context, next ) {
	const analyticsBasePath = '/jetpack/sso';
	const analyticsPageTitle = 'Jetpack SSO';

	removeSidebar( context );

	userModule.fetch();

	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	context.primary = React.createElement( JetpackSsoForm, {
		path: context.path,
		locale: context.params.locale,
		userModule: userModule,
		siteId: context.params.siteId,
		ssoNonce: context.params.ssoNonce,
	} );
	next();
}

export function plansLanding( context, next ) {
	const analyticsPageTitle = 'Plans';
	const basePath = route.sectionify( context.path );
	const analyticsBasePath = basePath + '/:site';

	removeSidebar( context );

	context.store.dispatch( setTitle( translate( 'Plans', { textOnly: true } ) ) );

	analytics.tracks.recordEvent( 'calypso_plans_view' );
	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	context.primary = (
		<PlansLanding
			context={ context }
			destinationType={ context.params.destinationType }
			interval={ context.params.interval }
			basePlansPath={ '/jetpack/connect/store' }
			url={ context.query.site }
		/>
	);
	next();
}

export function plansSelection( context, next ) {
	const analyticsPageTitle = 'Plans';
	const basePath = route.sectionify( context.path );
	const analyticsBasePath = basePath + '/:site';

	removeSidebar( context );

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( translate( 'Plans', { textOnly: true } ) ) );

	analytics.tracks.recordEvent( 'calypso_plans_view' );
	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	context.primary = (
		<CheckoutData>
			<Plans
				basePlansPath={ '/jetpack/connect/plans' }
				context={ context }
				destinationType={ context.params.destinationType }
				interval={ context.params.interval }
				queryRedirect={ context.query.redirect }
			/>
		</CheckoutData>
	);
	next();
}
