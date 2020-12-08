/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'calypso/config';
import { sectionify } from 'calypso/lib/route';
import { recordPageView } from 'calypso/lib/analytics/page-view';
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
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import store from 'store';
import { setCurrentFlowName } from 'calypso/state/signup/flow/actions';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import {
	getSiteVerticalId,
	getSiteVerticalIsUserInput,
} from 'calypso/state/signup/steps/site-vertical/selectors';
import { setSiteVertical } from 'calypso/state/signup/steps/site-vertical/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { setSiteType } from 'calypso/state/signup/steps/site-type/actions';
import { login } from 'calypso/lib/paths';
import { waitForHttpData } from 'calypso/state/data-layer/http-data';
import { requestGeoLocation } from 'calypso/state/data-getters';
import { getDotBlogVerticalId } from './config/dotblog-verticals';
import { abtest } from 'calypso/lib/abtest';
import user from 'calypso/lib/user';

/**
 * Constants
 */
const basePageTitle = 'Signup'; // used for analytics, doesn't require translation

/**
 * Module variables
 */
let initialContext;

const removeWhiteBackground = function () {
	if ( ! document ) {
		return;
	}

	document.body.classList.remove( 'is-white-signup' );
};

const gutenbergRedirect = function ( flowName ) {
	const url = new URL( window.location );
	if ( [ 'beginner', 'personal', 'premium', 'business', 'ecommerce' ].includes( flowName ) ) {
		url.pathname = `/new/${ flowName }`;
	} else {
		url.pathname = '/new';
	}
	window.location.replace( url.toString() );
};

export const addP2SignupClassName = () => {
	if ( ! document ) {
		return;
	}

	document.body.classList.add( 'is-p2-signup' );
};

export const removeP2SignupClassName = function () {
	if ( ! document ) {
		return;
	}

	document.body.classList.remove( 'is-p2-signup' );
};

export default {
	redirectTests( context, next ) {
		if ( context.pathname.indexOf( 'new-launch' ) >= 0 ) {
			next();
		} else if (
			context.pathname.indexOf( 'domain' ) >= 0 ||
			context.pathname.indexOf( 'plan' ) >= 0 ||
			context.pathname.indexOf( 'onboarding-registrationless' ) >= 0 ||
			context.pathname.indexOf( 'wpcc' ) >= 0 ||
			context.pathname.indexOf( 'launch-site' ) >= 0 ||
			context.params.flowName === 'user' ||
			context.params.flowName === 'account' ||
			context.params.flowName === 'crowdsignal' ||
			context.params.flowName === 'pressable-nux' ||
			context.params.flowName === 'clone-site'
		) {
			removeWhiteBackground();
			next();
		} else if ( context.pathname.includes( 'p2' ) ) {
			// We still want to keep the original styling for the new user creation step
			// so people know they are creating an account at WP.com.
			if ( context.pathname.includes( 'user' ) ) {
				removeP2SignupClassName();
			} else {
				addP2SignupClassName();
			}

			removeWhiteBackground();

			next();
		} else {
			const flowName = getFlowName( context.params );
			const userLoggedIn = isUserLoggedIn( context.store.getState() );
			if (
				userLoggedIn &&
				flowName === 'onboarding' &&
				'gutenberg' === abtest( 'existingUsersGutenbergOnboard' )
			) {
				gutenbergRedirect( context.params.flowName );
				return;
			}

			waitForHttpData( () => ( { geo: requestGeoLocation() } ) )
				.then( ( { geo } ) => {
					const countryCode = geo.data;
					if (
						( ! user() || ! user().get() ) &&
						-1 === context.pathname.indexOf( 'free' ) &&
						-1 === context.pathname.indexOf( 'personal' ) &&
						-1 === context.pathname.indexOf( 'premium' ) &&
						-1 === context.pathname.indexOf( 'business' ) &&
						-1 === context.pathname.indexOf( 'ecommerce' ) &&
						-1 === context.pathname.indexOf( 'with-theme' ) &&
						'variantUserless' === abtest( 'userlessCheckout', countryCode )
					) {
						removeWhiteBackground();
						const stepName = getStepName( context.params );
						const stepSectionName = getStepSectionName( context.params );
						const localeFromParams = context.params.lang;
						const urlWithLocale = getStepUrl(
							'onboarding-registrationless',
							stepName,
							stepSectionName,
							localeFromParams
						);
						window.location = urlWithLocale;
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
