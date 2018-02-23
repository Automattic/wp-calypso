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
import JetpackAuthorize from './authorize';
import JetpackConnect from './main';
import JetpackNewSite from './jetpack-new-site/index';
import JetpackSignup from './signup';
import JetpackSsoForm from './sso';
import NoDirectAccessError from './no-direct-access-error';
import Plans from './plans';
import PlansLanding from './plans-landing';
import versionCompare from 'lib/version-compare';
import { authorizeQueryDataSchema } from './schema';
import { authQueryTransformer } from './utils';
import { externalRedirect, sectionify } from 'lib/route';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getLocaleFromPath, removeLocaleFromPath } from 'lib/i18n-utils';
import { hideMasterbar, setSection, showMasterbar } from 'state/ui/actions';
import { JPC_PATH_PLANS, MOBILE_APP_REDIRECT_URL_WHITELIST } from './constants';
import { login } from 'lib/paths';
import { persistMobileRedirect, retrieveMobileRedirect, storePlan } from './persistence-utils';
import { receiveJetpackOnboardingCredentials } from 'state/jetpack-onboarding/actions';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { startAuthorizeStep } from 'state/jetpack-connect/actions';
import { urlToSlug } from 'lib/url';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from 'lib/plans/constants';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const analyticsPageTitleByType = {
	install: 'Jetpack Install',
	personal: 'Jetpack Connect Personal',
	premium: 'Jetpack Connect Premium',
	pro: 'Jetpack Install Pro',
};

const removeSidebar = context =>
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

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
	const isLoggedIn = !! getCurrentUserId( context.store.getState() );
	if ( isLoggedIn && getLocaleFromPath( context.path ) ) {
		const urlWithoutLocale = removeLocaleFromPath( context.path );
		debug( 'redirectWithoutLocaleIfLoggedIn to %s', urlWithoutLocale );
		return page.redirect( urlWithoutLocale );
	}

	next();
}

export function maybeOnboard( { query, store }, next ) {
	if ( ! isEmpty( query ) && query.onboarding ) {
		if ( query.site_url && query.jp_version && versionCompare( query.jp_version, '5.8', '<' ) ) {
			return externalRedirect( query.site_url + '/wp-admin/admin.php?page=jetpack#/dashboard' );
		}

		const siteId = parseInt( query.client_id, 10 );
		const siteSlug = urlToSlug( query.site_url );
		const credentials = {
			token: query.onboarding,
			siteUrl: query.site_url,
			userEmail: query.user_email,
		};

		store.dispatch( receiveJetpackOnboardingCredentials( siteId, credentials ) );

		return page.redirect( '/jetpack/start/' + siteSlug );
	}

	next();
}

export function newSite( context, next ) {
	analytics.pageView.record( '/jetpack/new', 'Add a new site (Jetpack)' );
	jetpackNewSiteSelector( context );
	next();
}

export function persistMobileAppFlow( context, next ) {
	const { query } = context;
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
	next();
}

export function setMasterbar( context, next ) {
	if ( config.isEnabled( 'jetpack/connect/mobile-app-flow' ) ) {
		const masterbarToggle = retrieveMobileRedirect() ? hideMasterbar() : showMasterbar();
		context.store.dispatch( masterbarToggle );
	}
	next();
}

export function connect( context, next ) {
	const { path, pathname, params, query } = context;
	const { type = false, interval } = params;
	const analyticsPageTitle = get( type, analyticsPageTitleByType, 'Jetpack Connect' );

	debug( 'entered connect flow with params %o', params );

	const planSlug = getPlanSlugFromFlowType( type, interval );

	// Not clearing the plan here, because other flows can set the cookie before arriving here.
	planSlug && storePlan( planSlug );

	analytics.pageView.record( pathname, analyticsPageTitle );

	removeSidebar( context );

	context.primary = React.createElement( JetpackConnect, {
		context,
		locale: params.locale,
		path,
		type,
		url: query.url,
		ctaId: query.cta_id, // origin tracking params
		ctaFrom: query.cta_from,
	} );
	next();
}

export function signupForm( context, next ) {
	analytics.pageView.record( 'jetpack/connect/authorize', 'Jetpack Authorize' );

	const isLoggedIn = !! getCurrentUserId( context.store.getState() );
	if ( retrieveMobileRedirect() && ! isLoggedIn ) {
		// Force login for mobile app flow. App will intercept this request and prompt native login.
		return window.location.replace( login( { isNative: true, redirectTo: context.path } ) );
	}

	removeSidebar( context );

	const { query } = context;
	const validQueryObject = validator( authorizeQueryDataSchema )( query );

	if ( validQueryObject ) {
		const transformedQuery = authQueryTransformer( query );
		context.store.dispatch( startAuthorizeStep( transformedQuery.clientId ) );

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
		context.store.dispatch( startAuthorizeStep( transformedQuery.clientId ) );
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

	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	context.primary = React.createElement( JetpackSsoForm, {
		path: context.path,
		locale: context.params.locale,
		siteId: context.params.siteId,
		ssoNonce: context.params.ssoNonce,
	} );
	next();
}

export function plansLanding( context, next ) {
	const analyticsPageTitle = 'Plans';
	const basePath = sectionify( context.path );
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
	const basePath = sectionify( context.path );
	const analyticsBasePath = basePath + '/:site';

	removeSidebar( context );

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( translate( 'Plans', { textOnly: true } ) ) );

	analytics.tracks.recordEvent( 'calypso_plans_view' );
	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	context.primary = (
		<CheckoutData>
			<Plans
				basePlansPath={ JPC_PATH_PLANS }
				context={ context }
				destinationType={ context.params.destinationType }
				interval={ context.params.interval }
				queryRedirect={ context.query.redirect }
			/>
		</CheckoutData>
	);
	next();
}
