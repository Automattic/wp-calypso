/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'config';
import { sectionify } from 'lib/route';
import { recordPageView } from 'lib/analytics/page-view';
import SignupComponent from './main';
import { getStepComponent } from './config/step-components';
import {
	getStepUrl,
	canResumeFlow,
	getFlowName,
	getStepName,
	getStepSectionName,
	getValidPath,
	getFlowPageTitle,
	shouldForceLogin,
} from './utils';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import store from 'store';
import { setCurrentFlowName } from 'state/signup/flow/actions';
import { setSelectedSiteId } from 'state/ui/actions';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { getSignupProgress } from 'state/signup/progress/selectors';
import { getCurrentFlowName } from 'state/signup/flow/selectors';
import {
	getSiteVerticalId,
	getSiteVerticalIsUserInput,
} from 'state/signup/steps/site-vertical/selectors';
import { setSiteVertical } from 'state/signup/steps/site-vertical/actions';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { setSiteType } from 'state/signup/steps/site-type/actions';
import { login } from 'lib/paths';
import { waitForData } from 'state/data-layer/http-data';
import { requestGeoLocation } from 'state/data-getters';
import { getDotBlogVerticalId } from './config/dotblog-verticals';
import { abtest } from 'lib/abtest';

/**
 * Constants
 */
const basePageTitle = 'Signup'; // used for analytics, doesn't require translation

/**
 * Module variables
 */
let initialContext;

const removeWhiteBackground = function () {
	document.body.className = document.body.className.split( 'is-white-signup' ).join( '' );
};

export default {
	redirectTests( context, next ) {
		if ( context.pathname.indexOf( 'new-launch' ) >= 0 ) {
			next();
		} else if (
			context.pathname.indexOf( 'domain' ) >= 0 ||
			context.pathname.indexOf( 'plan' ) >= 0 ||
			context.pathname.indexOf( 'wpcc' ) >= 0 ||
			context.pathname.indexOf( 'launch-site' ) >= 0 ||
			context.params.flowName === 'user' ||
			context.params.flowName === 'account' ||
			context.params.flowName === 'crowdsignal'
		) {
			removeWhiteBackground();
			next();
		} else {
			waitForData( {
				geo: () => requestGeoLocation(),
			} )
				.then( ( { geo } ) => {
					const countryCode = geo.data.body.country_short;
					if ( 'gutenberg' === abtest( 'newSiteGutenbergOnboarding', countryCode ) ) {
						window.location.replace( window.location.origin + '/new' + window.location.search );
					} else {
						removeWhiteBackground();
						next();
					}
				} )
				.catch( () => {
					removeWhiteBackground();
					next();
				} );
		}
	},
	redirectWithoutLocaleIfLoggedIn( context, next ) {
		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		if ( userLoggedIn && context.params.lang ) {
			const flowName = getFlowName( context.params );
			const stepName = getStepName( context.params );
			const stepSectionName = getStepSectionName( context.params );
			let urlWithoutLocale = getStepUrl( flowName, stepName, stepSectionName );

			if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
				return page.redirect( urlWithoutLocale );
			}

			if ( ! isEmpty( context.query ) ) {
				urlWithoutLocale += '?' + context.querystring;
			}

			if ( ! isEmpty( context.hash ) ) {
				urlWithoutLocale += '#' + context.hashstring;
			}

			window.location = urlWithoutLocale;
			return;
		}

		next();
	},

	saveInitialContext( context, next ) {
		if ( ! initialContext ) {
			initialContext = Object.assign( {}, context );
		}

		next();
	},

	redirectToFlow( context, next ) {
		const flowName = getFlowName( context.params );
		const localeFromParams = context.params.lang;
		const localeFromStore = store.get( 'signup-locale' );
		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		const signupProgress = getSignupProgress( context.store.getState() );

		// Special case for the user step which may use oauth2 redirect flow
		// Check if there is a valid flow in progress to resume
		// We're limited in the number of redirect uris we can provide so we only have a single one at /start/user
		if ( context.params.flowName === 'user' ) {
			const alternativeFlowName = getCurrentFlowName( context.store.getState() );
			if (
				alternativeFlowName &&
				alternativeFlowName !== flowName &&
				canResumeFlow( alternativeFlowName, signupProgress )
			) {
				window.location =
					getStepUrl(
						alternativeFlowName,
						getStepName( context.params ),
						getStepSectionName( context.params ),
						localeFromStore
					) +
					( context.querystring ? '?' + context.querystring : '' ) +
					( context.hashstring ? '#' + context.hashstring : '' );
				return;
			}
		}

		context.store.dispatch( setCurrentFlowName( flowName ) );

		if ( ! userLoggedIn && shouldForceLogin( flowName ) ) {
			return page.redirect( login( { isNative: true, redirectTo: context.path } ) );
		}

		// if flow can be resumed, use saved locale
		if (
			! userLoggedIn &&
			! localeFromParams &&
			localeFromStore &&
			canResumeFlow( flowName, signupProgress )
		) {
			window.location =
				getStepUrl(
					flowName,
					getStepName( context.params ),
					getStepSectionName( context.params ),
					localeFromStore
				) +
				( context.querystring ? '?' + context.querystring : '' ) +
				( context.hashstring ? '#' + context.hashstring : '' );
			return;
		}

		if ( context.pathname !== getValidPath( context.params ) ) {
			return page.redirect(
				getValidPath( context.params ) + ( context.querystring ? '?' + context.querystring : '' )
			);
		}

		store.set( 'signup-locale', localeFromParams );

		next();
	},

	async start( context, next ) {
		const basePath = sectionify( context.path );
		const flowName = getFlowName( context.params );
		const stepName = getStepName( context.params );
		const stepSectionName = getStepSectionName( context.params );

		const { query } = initialContext;

		// wait for the step component module to load
		const stepComponent = await getStepComponent( stepName );

		recordPageView( basePath, basePageTitle + ' > Start > ' + flowName + ' > ' + stepName, {
			flow: flowName,
		} );

		context.store.dispatch( setLayoutFocus( 'content' ) );
		context.store.dispatch( setCurrentFlowName( flowName ) );

		if ( flowName !== 'launch-site' ) {
			context.store.dispatch( setSelectedSiteId( null ) );
		}

		context.primary = React.createElement( SignupComponent, {
			store: context.store,
			path: context.path,
			initialContext,
			locale: context.params.lang,
			flowName: flowName,
			queryObject: query,
			refParameter: query && query.ref,
			stepName,
			stepSectionName,
			stepComponent,
			pageTitle: getFlowPageTitle( flowName ),
		} );

		next();
	},
	importSiteInfoFromQuery( { store: signupStore, query }, next ) {
		const state = signupStore.getState();
		const verticalId = getSiteVerticalId( state );
		const verticalIsUserInput = getSiteVerticalIsUserInput( state );
		const siteType = getSiteType( state );

		if ( ! siteType && query.site_type ) {
			signupStore.dispatch( setSiteType( query.site_type ) );
		}

		if ( ( ! verticalId || ! verticalIsUserInput ) && query.vertical ) {
			signupStore.dispatch(
				setSiteVertical( {
					id: getDotBlogVerticalId( query.vertical ) || query.vertical,
					isUserInput: false,
				} )
			);
		}

		next();
	},
};
