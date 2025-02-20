import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { isOnboardingFlow } from '@automattic/onboarding';
import { isEmpty } from 'lodash';
import { createElement } from 'react';
import store from 'store';
import { notFound } from 'calypso/controller';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { login } from 'calypso/lib/paths';
import { sectionify } from 'calypso/lib/route';
import { addQueryArgs } from 'calypso/lib/url';
import flows from 'calypso/signup/config/flows';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { updateDependencies } from 'calypso/state/signup/actions';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { setCurrentFlowName, setPreviousFlowName } from 'calypso/state/signup/flow/actions';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getStepComponent } from './config/step-components';
import SignupComponent from './main';
import {
	retrieveSignupDestination,
	getDomainsDependencies,
	clearSignupDestinationCookie,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
} from './storageUtils';
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
/**
 * Constants
 */
const basePageTitle = 'Signup'; // used for analytics, doesn't require translation

/**
 * Module variables
 */
let initialContext;
let previousFlowName;

function setReferrerPolicy() {
	try {
		// Remove existing <meta> tags with name="referrer"
		const existingMetaTags = document.querySelectorAll( 'meta[name="referrer"]' );
		existingMetaTags.forEach( ( tag ) => tag.remove() );

		// Create a new <meta> element
		const metaReferrer = document.createElement( 'meta' );
		metaReferrer.name = 'referrer';
		metaReferrer.content = 'strict-origin-when-cross-origin';

		// Append the new <meta> element to the <head> section
		document.head.appendChild( metaReferrer );
	} catch ( e ) {}
}

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
	redirectWithoutLocaleIfLoggedIn( context, next ) {
		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		if ( userLoggedIn && context.params.lang ) {
			const flowName = getFlowName( context.params, userLoggedIn );
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
		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		if ( ! initialContext ) {
			initialContext = Object.assign( {}, context );
		} else if (
			getFlowName( initialContext.params, userLoggedIn ) !==
			getFlowName( context.params, userLoggedIn )
		) {
			// Update the `initialContext` when the flow changes.
			initialContext = Object.assign( {}, initialContext, context );
		}

		next();
	},

	async redirectToFlow( context, next ) {
		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		const flowName = getFlowName( context.params, userLoggedIn );
		const localeFromParams = context.params.lang;
		const localeFromStore = ! userLoggedIn ? store.get( 'signup-locale' ) : '';
		const signupProgress = getSignupProgress( context.store.getState() );

		// Special case for the user step which may use oauth2 redirect flow
		// Check if there is a valid flow in progress to resume
		// We're limited in the number of redirect uris we can provide so we only have a single one at /start/user
		if ( context.params.flowName === 'user' ) {
			const alternativeFlowName = getCurrentFlowName( context.store.getState() );
			if (
				alternativeFlowName &&
				alternativeFlowName !== flowName &&
				canResumeFlow( alternativeFlowName, signupProgress, userLoggedIn )
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

		// Store the previous flow name (so we know from what flow we transitioned from).
		if ( ! previousFlowName ) {
			const persistedFlowName = getCurrentFlowName( context.store.getState() );
			if ( persistedFlowName ) {
				previousFlowName = persistedFlowName;
				context.store.dispatch( setPreviousFlowName( previousFlowName ) );
			}
		}

		context.store.dispatch( setCurrentFlowName( flowName ) );

		if ( ! userLoggedIn && shouldForceLogin( flowName, userLoggedIn ) ) {
			return page.redirect( login( { redirectTo: context.path } ) );
		}

		// if flow can be resumed, use saved locale
		if (
			! userLoggedIn &&
			! localeFromParams &&
			localeFromStore &&
			canResumeFlow( flowName, signupProgress, userLoggedIn )
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

		store.set( 'signup-locale', localeFromParams );

		if ( isOnboardingFlow( flowName ) ) {
			setReferrerPolicy();
			let url =
				getStepUrl(
					flowName,
					getStepName( context.params ),
					getStepSectionName( context.params ),
					localeFromParams ?? localeFromStore,
					null,
					'/setup'
				) +
				( context.querystring ? '?' + context.querystring : '' ) +
				( context.hashstring ? '#' + context.hashstring : '' );

			if ( document.referrer ) {
				url = addQueryArgs( { start_ref: document.referrer }, url );
			}

			window.location.replace( url );
			// skip the rest to avoid the `page.redirect` call below.
			// Don't call next() here, we don't need the subsequent middlewares to run.
			// next();
			return;
		}

		if ( context.pathname !== getValidPath( context.params, userLoggedIn ) ) {
			return page.redirect(
				getValidPath( context.params, userLoggedIn ) +
					( context.querystring ? '?' + context.querystring : '' )
			);
		}

		next();
	},

	async start( context, next ) {
		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		const basePath = sectionify( context.path );
		const flowName = getFlowName( context.params, userLoggedIn );
		const stepName = getStepName( context.params );
		const stepSectionName = getStepSectionName( context.params );
		const { providesDependenciesInQuery, excludeFromManageSiteFlows } = flows.getFlow(
			flowName,
			userLoggedIn
		);

		// Update initialContext to help woocommerce-install support site switching.
		if ( 'woocommerce-install' === flowName ) {
			if ( context?.query?.back_to ) {
				// forces back_to update
				context.store.dispatch( updateDependencies( { back_to: context.query.back_to } ) );
			}

			initialContext = context;
		}

		const { query } = initialContext;

		// wait for the step component module to load
		const stepComponent = await getStepComponent( stepName );

		const params = {
			flow: flowName,
		};

		recordPageView( basePath, basePageTitle + ' > Start > ' + flowName + ' > ' + stepName, params );

		context.store.dispatch( setLayoutFocus( 'content' ) );
		context.store.dispatch( setCurrentFlowName( flowName ) );

		const searchParams = new URLSearchParams( window.location.search );
		const isAddNewSiteFlow = searchParams.has( 'ref' );

		if ( isAddNewSiteFlow ) {
			clearSignupDestinationCookie();
		}

		// Checks if the user entered the signup flow via browser back from checkout page,
		// and if they did, we'll show a modified domain step to prevent creating duplicate sites,
		// check pau2Xa-1Io-p2#comment-6759.
		const signupDestinationCookieExists = retrieveSignupDestination();
		const isReEnteringFlow = getSignupCompleteFlowName() === flowName;
		const isReEnteringSignupViaBrowserBack =
			wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow;
		const isManageSiteFlow =
			! excludeFromManageSiteFlows && ! isAddNewSiteFlow && isReEnteringSignupViaBrowserBack;

		// Hydrate the store with domains dependencies from session storage,
		// only in the onboarding flow.
		const domainsDependencies = getDomainsDependencies();
		if (
			domainsDependencies &&
			isManageSiteFlow &&
			flowName === 'onboarding' &&
			stepName !== 'domains'
		) {
			const { step, dependencies } = JSON.parse( domainsDependencies );
			if ( step && dependencies ) {
				context.store.dispatch( submitSignupStep( step, dependencies ) );
			}
		}

		// If the flow has siteId or siteSlug as query dependencies, we should not clear selected site id
		if (
			! providesDependenciesInQuery?.includes( 'siteId' ) &&
			! providesDependenciesInQuery?.includes( 'siteSlug' ) &&
			! isManageSiteFlow
		) {
			context.store.dispatch( setSelectedSiteId( null ) );
		}

		// Set referral parameter in signup dependency store so we can retrieve it in getSignupDestination().
		const refParameter = query && query.ref;
		// Set design parameters in signup depencency store so we can retrieve it in getChecklistThemeDestination().
		const themeParameter = query && query.theme;
		const themeType = query && query.theme_type;
		const styleVariation = query && query.style_variation;
		const headerPatternId = query && query.header_pattern_id;
		const footerPatternId = query && query.footer_pattern_id;
		const sectionPatternIds = query && query.pattern_ids;
		const screen = query && query.screen;
		const screenParameter = query && query.screen_parameter;
		// Set plugin parameter in signup dependency store so we can retrieve it in getWithPluginDestination().
		const pluginParameter = query && query.plugin;
		const pluginBillingPeriod = query && query.billing_period;

		const additionalDependencies = {
			...( refParameter && { refParameter } ),
			...( themeParameter && { themeParameter } ),
			...( themeType && { themeType } ),
			...( styleVariation && { styleVariation } ),
			...( headerPatternId && { headerPatternId } ),
			...( footerPatternId && { footerPatternId } ),
			...( sectionPatternIds && { sectionPatternIds } ),
			...( screen && { screen } ),
			...( screenParameter && { screenParameter } ),
			...( pluginParameter && { pluginParameter } ),
			...( pluginBillingPeriod && { pluginBillingPeriod } ),
		};
		if ( ! isEmpty( additionalDependencies ) ) {
			context.store.dispatch( updateDependencies( additionalDependencies ) );
		}

		context.primary = createElement( SignupComponent, {
			store: context.store,
			path: context.path,
			initialContext,
			locale: context.params.lang,
			flowName,
			queryObject: query,
			refParameter,
			stepName,
			stepSectionName,
			stepComponent,
			pageTitle: getFlowPageTitle( flowName, userLoggedIn ),
			isManageSiteFlow,
		} );

		next();
	},
	setSelectedSiteForSignup( context, next ) {
		const { getState, dispatch } = context.store;
		const userLoggedIn = isUserLoggedIn( getState() );
		const flowName = getFlowName( context.params, userLoggedIn );
		const signupDependencies = getSignupDependencyStore( getState() );
		let siteIdOrSlug;

		if ( 'woocommerce-install' === flowName ) {
			// forces query precedence on woocommerce-install
			siteIdOrSlug = context.query?.siteSlug || signupDependencies?.siteSlug;
		} else {
			siteIdOrSlug =
				signupDependencies?.siteSlug ||
				context.query?.siteSlug ||
				signupDependencies?.siteId ||
				context.query?.siteId;
		}

		if ( ! siteIdOrSlug ) {
			next();
			return;
		}

		const siteId = getSiteId( getState(), siteIdOrSlug );
		if ( siteId ) {
			dispatch( setSelectedSiteId( siteId ) );
			next();
		} else {
			// Fetch the site by siteIdOrSlug and then try to select again
			dispatch( requestSite( siteIdOrSlug ) )
				.catch( () => {
					notFound( context, next );
					return null;
				} )
				.then( () => {
					let freshSiteId = getSiteId( getState(), siteIdOrSlug );

					if ( ! freshSiteId ) {
						const wpcomStagingFragment = siteIdOrSlug.replace(
							/\.wordpress\.com$/,
							'.wpcomstaging.com'
						);
						freshSiteId = getSiteId( getState(), wpcomStagingFragment );
					}

					if ( freshSiteId ) {
						dispatch( setSelectedSiteId( freshSiteId ) );
					}

					next();
				} );
		}
	},
};
