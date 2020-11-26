/**
 * External dependencies
 */
import debugFactory from 'debug';
import {
	assign,
	defer,
	difference,
	get,
	includes,
	isEmpty,
	isNull,
	omitBy,
	pick,
	startsWith,
	has,
} from 'lodash';
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import config from 'calypso/config';

// Libraries
import wpcom from 'calypso/lib/wp';
import guessTimezone from 'calypso/lib/i18n-utils/guess-timezone';
import user from 'calypso/lib/user';
import { abtest, getSavedVariations } from 'calypso/lib/abtest';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import {
	updatePrivacyForDomain,
	supportsPrivacyProtectionPurchase,
	planItem as getCartItemForPlan,
} from 'calypso/lib/cart-values/cart-items';
import { getUrlParts } from 'calypso/lib/url';

// State actions and selectors
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { getSiteTitle } from 'calypso/state/signup/steps/site-title/selectors';
import { getSurveyVertical, getSurveySiteType } from 'calypso/state/signup/steps/survey/selectors';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import {
	getSiteVerticalId,
	getSiteVerticalName,
} from 'calypso/state/signup/steps/site-vertical/selectors';
import { getSiteGoals } from 'calypso/state/signup/steps/site-goals/selectors';
import { getSiteStyle } from 'calypso/state/signup/steps/site-style/selectors';
import { getUserExperience } from 'calypso/state/signup/steps/user-experience/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	getSelectedImportEngine,
	getNuxUrlInputValue,
} from 'calypso/state/importer-nux/temp-selectors';
import getSiteId from 'calypso/state/selectors/get-site-id';
import { Site } from '@automattic/data-stores';
const Visibility = Site.Visibility;

// Current directory dependencies
import { isValidLandingPageVertical } from 'calypso/lib/signup/verticals';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';

import SignupCart from 'calypso/lib/signup/cart';

// Others
import flows from 'calypso/signup/config/flows';
import steps, { isDomainStepSkippable } from 'calypso/signup/config/steps';
import { isEligibleForPageBuilder, shouldEnterPageBuilder } from 'calypso/lib/signup/page-builder';
import { isDomainRegistration, isPersonal } from 'calypso/lib/products-values';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';

/**
 * Constants
 */
const debug = debugFactory( 'calypso:signup:step-actions' );

export function createSiteOrDomain( callback, dependencies, data, reduxStore ) {
	const { siteId, siteSlug } = data;
	const { cartItem, designType, siteUrl, themeSlugWithRepo } = dependencies;
	const domainItem = dependencies.domainItem
		? addPrivacyProtectionIfSupported( dependencies.domainItem, reduxStore.getState() )
		: null;

	if ( designType === 'domain' ) {
		const cartKey = 'no-site';
		const providedDependencies = {
			siteId: null,
			siteSlug: cartKey,
			themeSlugWithRepo: null,
			domainItem,
		};

		const domainChoiceCart = [ domainItem ];
		SignupCart.createCart( cartKey, domainChoiceCart, ( error ) =>
			callback( error, providedDependencies )
		);
	} else if ( designType === 'existing-site' ) {
		const providedDependencies = {
			siteId,
			siteSlug,
		};

		SignupCart.createCart(
			siteId,
			omitBy( pick( dependencies, 'domainItem', 'privacyItem', 'cartItem' ), isNull ),
			( error ) => {
				callback( error, providedDependencies );
			}
		);
	} else {
		const newSiteData = {
			cartItem,
			domainItem,
			isPurchasingItem: true,
			siteUrl,
			themeSlugWithRepo,
		};

		createSiteWithCart(
			( errors, providedDependencies ) => {
				callback(
					errors,
					pick( providedDependencies, [ 'siteId', 'siteSlug', 'themeSlugWithRepo', 'domainItem' ] )
				);
			},
			dependencies,
			newSiteData,
			reduxStore
		);
	}
}

// We are experimenting making site topic (site vertical name) a separate step from the survey.
// Once we've decided to fully move away from the survey form, we can just keep the site vertical name here.
function getSiteVertical( state ) {
	return ( getSiteVerticalName( state ) || getSurveyVertical( state ) ).trim();
}

function getNewSiteParams( {
	dependencies,
	flowToCheck,
	isPurchasingDomainItem,
	lastKnownFlow,
	themeSlugWithRepo,
	siteUrl,
	state,
} ) {
	const signupDependencies = getSignupDependencyStore( state );
	const designType = getDesignType( state ).trim();
	const siteTitle = getSiteTitle( state ).trim();
	const siteVerticalId = getSiteVerticalId( state );
	const siteVerticalName = getSiteVerticalName( state );
	const siteGoals = getSiteGoals( state ).trim();
	const siteType = getSiteType( state ).trim();
	const siteStyle = getSiteStyle( state ).trim();
	const siteSegment = getSiteTypePropertyValue( 'slug', siteType, 'id' );
	const siteTypeTheme = getSiteTypePropertyValue( 'slug', siteType, 'theme' );

	const shouldSkipDomainStep = ! siteUrl && isDomainStepSkippable( flowToCheck );
	const shouldHideFreePlan = get( getSignupDependencyStore( state ), 'shouldHideFreePlan', false );
	const useAutoGeneratedBlogName = shouldSkipDomainStep || shouldHideFreePlan;

	// The theme can be provided in this step's dependencies,
	// the step object itself depending on if the theme is provided in a
	// query (see `getThemeSlug` in `DomainsStep`),
	// or the Signup dependency store. Defaults to site type theme.
	const theme =
		dependencies.themeSlugWithRepo ||
		themeSlugWithRepo ||
		get( signupDependencies, 'themeSlugWithRepo', false ) ||
		siteTypeTheme;

	// We will use the default annotation instead of theme annotation as fallback,
	// when segment and vertical values are not sent. Check pbAok1-p2#comment-834.
	const shouldUseDefaultAnnotationAsFallback = true;

	const newSiteParams = {
		blog_title: siteTitle,
		options: {
			designType: designType || undefined,
			theme,
			use_theme_annotation: get( signupDependencies, 'useThemeHeadstart', false ),
			default_annotation_as_primary_fallback: shouldUseDefaultAnnotationAsFallback,
			siteGoals: siteGoals || undefined,
			site_style: siteStyle || undefined,
			site_segment: siteSegment || undefined,
			site_vertical: siteVerticalId || undefined,
			site_vertical_name: siteVerticalName || undefined,
			site_information: {
				title: siteTitle,
			},
			site_creation_flow: flowToCheck,
			timezone_string: guessTimezone(),
		},
		validate: false,
	};

	if ( config.isEnabled( 'coming-soon-v2' ) ) {
		newSiteParams.options.wpcom_public_coming_soon = 1;
		newSiteParams.public = Visibility.PublicNotIndexed;
	} else {
		newSiteParams.options.wpcom_coming_soon = 1;
		newSiteParams.public = Visibility.Private;
	}

	if ( useAutoGeneratedBlogName ) {
		newSiteParams.blog_name =
			user().get()?.username ||
			get( signupDependencies, 'username' ) ||
			siteTitle ||
			siteType ||
			getSiteVertical( state );
		newSiteParams.find_available_url = true;
	} else {
		newSiteParams.blog_name = siteUrl;
		newSiteParams.find_available_url = !! isPurchasingDomainItem;
	}

	if ( 'import' === lastKnownFlow || 'import-onboarding' === lastKnownFlow ) {
		// If `siteTitle` wasn't inferred by the site detection api, use
		// the `siteUrl` until an import replaces it with an actual title.
		newSiteParams.blog_title = siteTitle || siteUrl;
		newSiteParams.options.nux_import_engine = getSelectedImportEngine( state );
		newSiteParams.options.nux_import_from_url = getNuxUrlInputValue( state );
	}

	// Provide the default business starter content for the FSE user testing flow.
	if ( 'test-fse' === lastKnownFlow ) {
		newSiteParams.options.site_segment = 1;
	}

	if ( isEligibleForPageBuilder( siteSegment, flowToCheck ) && shouldEnterPageBuilder() ) {
		newSiteParams.options.in_page_builder = true;
	}

	return newSiteParams;
}

function saveToLocalStorageAndProceed( state, domainItem, themeItem, newSiteParams, callback ) {
	const cartItem = get( getSignupDependencyStore( state ), 'cartItem', undefined );
	const newCartItems = [ cartItem, domainItem ].filter( ( item ) => item );

	const newCartItemsToAdd = newCartItems.map( ( item ) =>
		addPrivacyProtectionIfSupported( item, state )
	);

	try {
		window.localStorage.setItem( 'shoppingCart', JSON.stringify( newCartItemsToAdd ) );
		window.localStorage.setItem( 'siteParams', JSON.stringify( newSiteParams ) );
	} catch ( e ) {
		throw new Error( 'An unexpected error occured while saving your cart: ' + e );
	}

	const providedDependencies = {
		domainItem,
		themeItem,
		siteId: undefined,
		siteSlug: 'no-site',
	};

	callback( undefined, providedDependencies );
}

export function createSiteWithCart( callback, dependencies, stepData, reduxStore ) {
	const {
		domainItem,
		flowName,
		lastKnownFlow,
		googleAppsCartItem,
		isPurchasingItem: isPurchasingDomainItem,
		siteUrl,
		themeSlugWithRepo,
		themeItem,
	} = stepData;

	// flowName isn't always passed in
	const flowToCheck = flowName || lastKnownFlow;

	const newCartItems = [ domainItem, googleAppsCartItem, themeItem ].filter( ( item ) => item );

	const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' ) && ! themeItem;
	const state = reduxStore.getState();
	const bearerToken = get( getSignupDependencyStore( state ), 'bearer_token', null );

	const isManageSiteFlow = get( getSignupDependencyStore( state ), 'isManageSiteFlow', false );

	if ( isManageSiteFlow ) {
		const siteSlug = get( getSignupDependencyStore( state ), 'siteSlug', undefined );
		const siteId = getSiteId( state, siteSlug );
		const providedDependencies = { domainItem, siteId, siteSlug, themeItem };
		addDomainToCart( callback, dependencies, stepData, reduxStore, siteSlug, providedDependencies );
		return;
	}

	const newSiteParams = getNewSiteParams( {
		dependencies,
		flowToCheck,
		isPurchasingDomainItem,
		lastKnownFlow,
		themeSlugWithRepo,
		siteUrl,
		state,
	} );

	if ( isEmpty( bearerToken ) && 'onboarding-registrationless' === flowToCheck ) {
		saveToLocalStorageAndProceed( state, domainItem, themeItem, newSiteParams, callback );
		return;
	}

	wpcom.undocumented().sitesNew( newSiteParams, function ( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		const parsedBlogURL = getUrlParts( response.blog_details.url );

		const siteSlug = parsedBlogURL.hostname;
		const siteId = response.blog_details.blogid;
		const providedDependencies = {
			siteId,
			siteSlug,
			domainItem,
			themeItem,
		};
		processItemCart(
			providedDependencies,
			newCartItems,
			callback,
			reduxStore,
			siteSlug,
			isFreeThemePreselected,
			themeSlugWithRepo
		);
	} );
}

export function setThemeOnSite( callback, { siteSlug, themeSlugWithRepo } ) {
	if ( isEmpty( themeSlugWithRepo ) ) {
		defer( callback );

		return;
	}

	wpcom
		.undocumented()
		.changeTheme( siteSlug, { theme: themeSlugWithRepo.split( '/' )[ 1 ] }, function ( errors ) {
			callback( isEmpty( errors ) ? undefined : [ errors ] );
		} );
}

export function addPlanToCart( callback, dependencies, stepProvidedItems, reduxStore ) {
	const { siteSlug } = dependencies;
	const { cartItem } = stepProvidedItems;
	if ( isEmpty( cartItem ) ) {
		// the user selected the free plan
		defer( callback );

		return;
	}

	const state = reduxStore.getState();
	const domainUpsellItems =
		get( getSignupDependencyStore( state ), 'domainUpsellItems', null ) || [];
	const providedDependencies = { cartItem };

	const newCartItems = [ cartItem ].filter( ( item ) => item ).concat( domainUpsellItems );

	processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, null, null );
}

export function addDomainToCart(
	callback,
	dependencies,
	stepProvidedItems,
	reduxStore,
	siteSlug,
	stepProvidedDependencies
) {
	const slug = siteSlug || dependencies.siteSlug;
	const { domainItem, googleAppsCartItem } = stepProvidedItems;
	const providedDependencies = stepProvidedDependencies || { domainItem };

	const newCartItems = [ domainItem, googleAppsCartItem ].filter( ( item ) => item );

	processItemCart( providedDependencies, newCartItems, callback, reduxStore, slug, null, null );
}

function processItemCart(
	providedDependencies,
	newCartItems,
	callback,
	reduxStore,
	siteSlug,
	isFreeThemePreselected,
	themeSlugWithRepo
) {
	const addToCartAndProceed = () => {
		const newCartItemsToAdd = newCartItems.map( ( item ) =>
			addPrivacyProtectionIfSupported( item, reduxStore.getState() )
		);

		if ( newCartItemsToAdd.length ) {
			SignupCart.addToCart( siteSlug, newCartItemsToAdd, function ( cartError ) {
				callback( cartError, providedDependencies );
			} );
		} else {
			callback( undefined, providedDependencies );
		}
	};

	if ( ! user().get() && isFreeThemePreselected ) {
		setThemeOnSite( addToCartAndProceed, { siteSlug, themeSlugWithRepo } );
	} else if ( user().get() && isFreeThemePreselected ) {
		fetchSitesAndUser(
			siteSlug,
			setThemeOnSite.bind( null, addToCartAndProceed, { siteSlug, themeSlugWithRepo } ),
			reduxStore
		);
	} else if ( user().get() && siteSlug ) {
		fetchSitesAndUser( siteSlug, addToCartAndProceed, reduxStore );
	} else {
		addToCartAndProceed();
	}
}

function addPrivacyProtectionIfSupported( item, state ) {
	const { product_slug: productSlug } = item;
	const productsList = getProductsList( state );
	if ( supportsPrivacyProtectionPurchase( productSlug, productsList ) ) {
		return updatePrivacyForDomain( item, true );
	}

	return item;
}

export function launchSiteApi( callback, dependencies ) {
	const { siteSlug } = dependencies;

	wpcom.undocumented().launchSite( siteSlug, function ( error ) {
		if ( error ) {
			callback( error );

			return;
		}

		callback();
	} );
}

export function createAccount(
	callback,
	dependencies,
	{
		userData,
		flowName,
		lastKnownFlow,
		queryArgs,
		service,
		access_token,
		id_token,
		oauth2Signup,
		recaptchaDidntLoad,
		recaptchaFailed,
		recaptchaToken,
	},
	reduxStore
) {
	const flowToCheck = flowName || lastKnownFlow;

	if ( 'onboarding-registrationless' === flowToCheck ) {
		const { cartItem, domainItem } = dependencies;
		const isPurchasingItem = ! isEmpty( cartItem ) || ! isEmpty( domainItem );

		// If purchasing item in this flow, return without creating a user account.
		if ( isPurchasingItem ) {
			const providedDependencies = { allowUnauthenticated: true };
			return defer( () => callback( undefined, providedDependencies ) );
		}
	}

	const state = reduxStore.getState();

	const siteVertical = getSiteVertical( state );
	const surveySiteType = getSurveySiteType( state ).trim();
	const userExperience = getUserExperience( state );

	const SIGNUP_TYPE_SOCIAL = 'social';
	const SIGNUP_TYPE_DEFAULT = 'default';

	const responseHandler = ( signupType ) => ( error, response ) => {
		const emailInError =
			signupType === SIGNUP_TYPE_SOCIAL ? { email: get( error, 'data.email', undefined ) } : {};
		const errors =
			error && error.error
				? [
						{
							error: error.error,
							message: error.message,
							...emailInError,
						},
				  ]
				: undefined;

		if ( errors ) {
			callback( errors );
			return;
		}

		// we should either have an error with an error property, or we should have a response with a bearer_token
		const bearerToken = {};
		if ( response && response.bearer_token ) {
			bearerToken.bearer_token = response.bearer_token;
		} else {
			// something odd happened...
			//eslint-disable-next-line no-console
			console.error( 'Expected either an error or a bearer token. got %o, %o.', error, response );
		}

		const username =
			( response && response.signup_sandbox_username ) ||
			( response && response.username ) ||
			userData.username;

		const userId =
			( response && response.signup_sandbox_user_id ) ||
			( response && response.user_id ) ||
			userData.ID;

		const email =
			( response && response.email ) || ( userData && ( userData.email || userData.user_email ) );

		const registrationUserData = {
			ID: userId,
			username,
			email,
		};

		const marketing_price_group = response?.marketing_price_group ?? '';

		// Fire after a new user registers.
		recordRegistration( {
			userData: registrationUserData,
			flow: flowName,
			type: signupType,
		} );

		const providedDependencies = assign( { username, marketing_price_group }, bearerToken );

		if ( signupType === SIGNUP_TYPE_DEFAULT && oauth2Signup ) {
			assign( providedDependencies, {
				oauth2_client_id: queryArgs.oauth2_client_id,
				oauth2_redirect: get( response, 'oauth2_redirect', '' ).split( '@' )[ 1 ],
			} );
		}

		callback( undefined, providedDependencies );
	};

	if ( service ) {
		// We're creating a new social account
		wpcom.undocumented().usersSocialNew(
			{
				service,
				access_token,
				id_token,
				signup_flow_name: flowName,
				...userData,
			},
			responseHandler( SIGNUP_TYPE_SOCIAL )
		);
	} else {
		wpcom.undocumented().usersNew(
			assign(
				{},
				userData,
				{
					ab_test_variations: getSavedVariations(),
					validate: false,
					signup_flow_name: flowName,
					nux_q_site_type: surveySiteType,
					nux_q_question_primary: siteVertical,
					nux_q_question_experience: userExperience || undefined,
					// url sent in the confirmation email
					jetpack_redirect: queryArgs.jetpack_redirect,
				},
				oauth2Signup
					? {
							oauth2_client_id: queryArgs.oauth2_client_id,
							// url of the WordPress.com authorize page for this OAuth2 client
							// convert to legacy oauth2_redirect format: %s@https://public-api.wordpress.com/oauth2/authorize/...
							oauth2_redirect: queryArgs.oauth2_redirect && '0@' + queryArgs.oauth2_redirect,
					  }
					: null,
				recaptchaDidntLoad ? { 'g-recaptcha-error': 'recaptcha_didnt_load' } : null,
				recaptchaFailed ? { 'g-recaptcha-error': 'recaptcha_failed' } : null,
				recaptchaToken ? { 'g-recaptcha-response': recaptchaToken } : null
			),
			responseHandler( SIGNUP_TYPE_DEFAULT )
		);
	}
}

export function createSite( callback, dependencies, stepData, reduxStore ) {
	const { themeSlugWithRepo } = dependencies;
	const { site } = stepData;

	const data = {
		blog_name: site,
		blog_title: '',
		options: { theme: themeSlugWithRepo, timezone_string: guessTimezone() },
		validate: false,
	};

	if ( config.isEnabled( 'coming-soon-v2' ) ) {
		data.options.wpcom_public_coming_soon = 1;
		data.public = Visibility.PublicNotIndexed;
	} else {
		data.options.wpcom_coming_soon = 1;
		data.public = Visibility.Private;
	}

	wpcom.undocumented().sitesNew( data, function ( errors, response ) {
		let providedDependencies;
		let siteSlug;

		if ( response && response.blog_details ) {
			const parsedBlogURL = getUrlParts( response.blog_details.url );
			siteSlug = parsedBlogURL.hostname;

			providedDependencies = { siteSlug };
		}

		if ( user().get() && isEmpty( errors ) ) {
			fetchSitesAndUser( siteSlug, () => callback( undefined, providedDependencies ), reduxStore );
		} else {
			callback( isEmpty( errors ) ? undefined : [ errors ], providedDependencies );
		}
	} );
}

export function createWpForTeamsSite( callback, dependencies, stepData, reduxStore ) {
	const { site, siteTitle } = stepData;

	// The new p2 theme for WP for Teams project.
	// More info: https://wp.me/p9lV3a-1dM-p2
	const themeSlugWithRepo = 'pub/p2020';

	const data = {
		blog_name: site,
		blog_title: siteTitle,
		public: -1, // wp for teams sites are not supposed to be public
		options: {
			theme: themeSlugWithRepo,
			timezone_string: guessTimezone(),
			is_wpforteams_site: true,
		},
		validate: false,
	};

	wpcom.undocumented().sitesNew( data, function ( errors, response ) {
		let providedDependencies;
		let siteSlug;

		if ( response && response.blog_details ) {
			const parsedBlogURL = getUrlParts( response.blog_details.url );
			siteSlug = parsedBlogURL.hostname;

			providedDependencies = { siteSlug };
		}

		if ( user().get() && isEmpty( errors ) ) {
			fetchSitesAndUser( siteSlug, () => callback( undefined, providedDependencies ), reduxStore );
		} else {
			callback( isEmpty( errors ) ? undefined : [ errors ], providedDependencies );
		}
	} );
}

function recordExcludeStepEvent( step, value ) {
	recordTracksEvent( 'calypso_signup_actions_exclude_step', {
		step,
		value,
	} );
}

function shouldExcludeStep( stepName, fulfilledDependencies ) {
	if ( isEmpty( fulfilledDependencies ) ) {
		return false;
	}

	const stepProvidesDependencies = steps[ stepName ].providesDependencies;
	const stepOptionalDependencies = steps[ stepName ].optionalDependencies;

	const dependenciesNotProvided = difference(
		stepProvidesDependencies,
		stepOptionalDependencies,
		fulfilledDependencies
	);

	return isEmpty( dependenciesNotProvided );
}

function excludeDomainStep( stepName, tracksEventValue, submitSignupStep ) {
	let fulfilledDependencies = [];
	const domainItem = undefined;

	submitSignupStep( { stepName, domainItem }, { domainItem } );
	recordExcludeStepEvent( stepName, tracksEventValue );

	fulfilledDependencies = [ 'domainItem', 'siteId', 'siteSlug', 'themeItem' ];

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export function isDomainFulfilled( stepName, defaultDependencies, nextProps ) {
	const { siteDomains, submitSignupStep } = nextProps;

	if ( siteDomains && siteDomains.length > 1 ) {
		const tracksEventValue = siteDomains.map( ( siteDomain ) => siteDomain.domain ).join( ', ' );
		excludeDomainStep( stepName, tracksEventValue, submitSignupStep );
	}
}

export function maybeRemoveStepForUserlessCheckout( stepName, defaultDependencies, nextProps ) {
	if ( 'onboarding-registrationless' !== nextProps.flowName ) {
		return;
	}

	const { submitSignupStep } = nextProps;
	const cartItem = get( nextProps, 'signupDependencies.cartItem', false );
	const domainItem = get( nextProps, 'signupDependencies.domainItem', false );
	const isPurchasingItem = ! isEmpty( cartItem ) || ! isEmpty( domainItem );

	if ( isPurchasingItem ) {
		if ( includes( flows.excludedSteps, stepName ) ) {
			return;
		}

		submitSignupStep(
			{ stepName },
			{ bearer_token: null, username: null, marketing_price_group: null }
		);
		recordExcludeStepEvent( stepName, null );

		const fulfilledDependencies = [ 'bearer_token', 'username', 'marketing_price_group' ];

		if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
			flows.excludeStep( stepName );
		}
	} else if ( includes( flows.excludedSteps, stepName ) ) {
		flows.resetExcludedStep( stepName );
		nextProps.removeStep( { stepName } );
	}
}

export function isPlanFulfilled( stepName, defaultDependencies, nextProps ) {
	const { isPaidPlan, sitePlanSlug, submitSignupStep } = nextProps;
	let fulfilledDependencies = [];

	if ( isPaidPlan ) {
		const cartItem = undefined;
		submitSignupStep( { stepName, cartItem, wasSkipped: true }, { cartItem } );
		recordExcludeStepEvent( stepName, sitePlanSlug );
		fulfilledDependencies = [ 'cartItem' ];
	} else if ( defaultDependencies && defaultDependencies.cartItem ) {
		const cartItem = getCartItemForPlan( defaultDependencies.cartItem );
		submitSignupStep( { stepName, cartItem, wasSkipped: true }, { cartItem } );
		recordExcludeStepEvent( stepName, defaultDependencies.cartItem );
		fulfilledDependencies = [ 'cartItem' ];
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export function isSiteTypeFulfilled( stepName, defaultDependencies, nextProps ) {
	if ( isEmpty( nextProps.initialContext && nextProps.initialContext.query ) ) {
		return;
	}

	const {
		initialContext: {
			query: { site_type: siteType },
		},
	} = nextProps;

	const siteTypeValue = getSiteTypePropertyValue( 'slug', siteType, 'slug' );
	let fulfilledDependencies = [];

	if ( siteTypeValue ) {
		debug( 'From query string: site_type = %s', siteType );
		debug( 'Site type value = %s', siteTypeValue );

		nextProps.submitSiteType( siteType );
		recordExcludeStepEvent( stepName, siteType );

		// nextProps.submitSiteType( siteType ) above provides dependencies
		fulfilledDependencies = fulfilledDependencies.concat( [ 'siteType', 'themeSlugWithRepo' ] );
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export function isSiteTopicFulfilled( stepName, defaultDependencies, nextProps ) {
	if ( isEmpty( nextProps.initialContext && nextProps.initialContext.query ) ) {
		return;
	}

	const {
		initialContext: {
			query: { vertical },
		},
		flowName,
	} = nextProps;

	const flowSteps = flows.getFlow( flowName ).steps;
	let fulfilledDependencies = [];

	if ( vertical && -1 === flowSteps.indexOf( 'survey' ) ) {
		debug( 'From query string: vertical = %s', vertical );

		nextProps.setSurvey( { vertical, otherText: '' } );

		nextProps.submitSignupStep(
			{ stepName: 'survey', wasSkipped: true },
			{ surveySiteType: 'blog', surveyQuestion: vertical }
		);

		nextProps.submitSiteVertical( { name: vertical }, stepName );

		// Track our landing page verticals
		if ( isValidLandingPageVertical( vertical ) ) {
			recordTracksEvent( 'calypso_signup_vertical_landing_page', {
				vertical,
				flow: flowName,
			} );
		}

		//Add to fulfilled dependencies
		fulfilledDependencies = fulfilledDependencies.concat( [
			'surveySiteType',
			'surveyQuestion',
			'siteTopic',
		] );

		recordExcludeStepEvent( stepName, vertical );
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export function isSecureYourBrandFulfilled( stepName, defaultDependencies, nextProps ) {
	const hasDomain = has( nextProps, 'signupDependencies.domainItem' );
	const hasPlan = has( nextProps, 'signupDependencies.cartItem' );
	const { submitSignupStep } = nextProps;
	const domainItem = get( nextProps, 'signupDependencies.domainItem', false );
	const cartItem = get( nextProps, 'signupDependencies.cartItem', false );
	const skipSecureYourBrand = get( nextProps, 'skipSecureYourBrand', false );
	const isNotRegistration = ! ( domainItem && isDomainRegistration( domainItem ) );
	const planDoesNotSupportUpsell = ! cartItem || isPersonal( cartItem );
	const cookies = cookie.parse( document.cookie );
	const isUs = cookies?.country_code === 'US';

	if ( ! hasDomain || ! hasPlan ) {
		return;
	}

	if (
		isNotRegistration ||
		skipSecureYourBrand ||
		planDoesNotSupportUpsell ||
		isUs ||
		'test' !== abtest( 'secureYourBrand' )
	) {
		const domainUpsellItems = null;
		submitSignupStep( { stepName, domainUpsellItems, wasSkipped: true }, { domainUpsellItems } );
		flows.excludeStep( stepName );
	}
}
