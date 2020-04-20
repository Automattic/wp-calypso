/**
 * External Dependencies
 */
import React from 'react';
import Debug from 'debug';
import page from 'page';
import { get, some, dropRight } from 'lodash';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import InstallInstructions from './install-instructions';
import JetpackAuthorize from './authorize';
import JetpackConnect from './main';
import JetpackNewSite from './jetpack-new-site/index';
import JetpackSignup from './signup';
import JetpackSsoForm from './sso';
import NoDirectAccessError from './no-direct-access-error';
import OrgCredentialsForm from './remote-credentials';
import Plans from './plans';
import PlansLanding from './plans-landing';
import { addQueryArgs, sectionify } from 'lib/route';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getLocaleFromPath, removeLocaleFromPath, getPathParts } from 'lib/i18n-utils';
import switchLocale from 'lib/i18n-utils/switch-locale';
import { hideMasterbar, showMasterbar, hideSidebar } from 'state/ui/actions';
import { JPC_PATH_PLANS, MOBILE_APP_REDIRECT_URL_WHITELIST } from './constants';
import { login } from 'lib/paths';
import { parseAuthorizationQuery } from './utils';
import { persistMobileRedirect, retrieveMobileRedirect, storePlan } from './persistence-utils';
import { startAuthorizeStep } from 'state/jetpack-connect/actions';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from 'lib/plans/constants';

import {
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
} from 'lib/products-values/constants';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const analyticsPageTitleByType = {
	install: 'Jetpack Install',
	personal: 'Jetpack Connect Personal',
	premium: 'Jetpack Connect Premium',
	pro: 'Jetpack Install Pro',
	realtimebackup: 'Jetpack Realtime Backup',
	backup: 'Jetpack Daily Backup',
	jetpack_search: 'Jetpack Search',
	scan: 'Jetpack Scan',
};

const removeSidebar = context => context.store.dispatch( hideSidebar() );

const getPlanSlugFromFlowType = ( type, interval = 'yearly' ) => {
	const planSlugs = {
		yearly: {
			personal: PLAN_JETPACK_PERSONAL,
			premium: PLAN_JETPACK_PREMIUM,
			pro: PLAN_JETPACK_BUSINESS,
			realtimebackup: PRODUCT_JETPACK_BACKUP_REALTIME,
			backup: PRODUCT_JETPACK_BACKUP_DAILY,
			jetpack_search: PRODUCT_JETPACK_SEARCH,
			scan: PRODUCT_JETPACK_SCAN,
		},
		monthly: {
			personal: PLAN_JETPACK_PERSONAL_MONTHLY,
			premium: PLAN_JETPACK_PREMIUM_MONTHLY,
			pro: PLAN_JETPACK_BUSINESS_MONTHLY,
			realtimebackup: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
			backup: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
			jetpack_search: PRODUCT_JETPACK_SEARCH_MONTHLY,
			scan: PRODUCT_JETPACK_SCAN_MONTHLY,
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

export function newSite( context, next ) {
	analytics.pageView.record( '/jetpack/new', 'Add a new site (Jetpack)' );
	removeSidebar( context );
	context.primary = <JetpackNewSite locale={ context.params.locale } path={ context.path } />;
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
	const planSlug = getPlanSlugFromFlowType( type, interval );

	// Not clearing the plan here, because other flows can set the cookie before arriving here.
	planSlug && storePlan( planSlug );
	analytics.pageView.record( pathname, analyticsPageTitle );

	removeSidebar( context );

	context.primary = (
		<JetpackConnect
			ctaFrom={ query.cta_from /* origin tracking params */ }
			ctaId={ query.cta_id /* origin tracking params */ }
			locale={ params.locale }
			path={ path }
			type={ type }
			url={ query.url }
			forceRemoteInstall={ query.forceInstall }
		/>
	);
	next();
}

export function instructions( context, next ) {
	analytics.pageView.record(
		'jetpack/connect/instructions',
		'Jetpack Manual Install Instructions'
	);

	const url = context.query.url;
	if ( ! url ) {
		return page.redirect( '/jetpack/connect' );
	}
	context.primary = <InstallInstructions remoteSiteUrl={ url } />;
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
	const transformedQuery = parseAuthorizationQuery( query );
	if ( transformedQuery ) {
		context.store.dispatch( startAuthorizeStep( transformedQuery.clientId ) );

		const { locale } = context.params;
		context.primary = (
			<JetpackSignup path={ context.path } locale={ locale } authQuery={ transformedQuery } />
		);
	} else {
		context.primary = <NoDirectAccessError />;
	}
	next();
}

export function credsForm( context, next ) {
	context.primary = <OrgCredentialsForm />;
	next();
}

export function authorizeForm( context, next ) {
	analytics.pageView.record( 'jetpack/connect/authorize', 'Jetpack Authorize' );

	removeSidebar( context );

	const { query } = context;
	const transformedQuery = parseAuthorizationQuery( query );
	if ( transformedQuery ) {
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

	context.primary = (
		<JetpackSsoForm
			locale={ context.params.locale }
			path={ context.path }
			siteId={ context.params.siteId }
			ssoNonce={ context.params.ssoNonce }
		/>
	);
	next();
}

export function plansLanding( context, next ) {
	const analyticsPageTitle = 'Plans';
	const basePath = sectionify( context.path );
	const analyticsBasePath = basePath + '/:site';

	removeSidebar( context );

	analytics.tracks.recordEvent( 'calypso_plans_view' );
	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	context.primary = (
		<PlansLanding
			context={ context }
			interval={ context.params.interval }
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

	analytics.tracks.recordEvent( 'calypso_plans_view' );
	analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

	context.primary = (
		<Plans
			basePlansPath={
				context.query.redirect
					? addQueryArgs( { redirect: context.query.redirect }, JPC_PATH_PLANS )
					: JPC_PATH_PLANS
			}
			context={ context }
			interval={ context.params.interval }
			queryRedirect={ context.query.redirect }
		/>
	);
	next();
}

/**
 * Checks for a locale fragment at the end of context.path
 * and switches to that locale if the user is logged out.
 * If the user is logged in we remove the fragment and defer to the user's settings.
 *
 * @param {object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 */
export function setLoggedOutLocale( context, next ) {
	const isLoggedIn = !! getCurrentUserId( context.store.getState() );
	const locale = getLocaleFromPath( context.path );

	if ( ! locale ) {
		return next();
	}

	if ( isLoggedIn ) {
		page.redirect( dropRight( getPathParts( context.path ) ).join( '/' ) );
	} else {
		switchLocale( locale );
	}

	next();
}
