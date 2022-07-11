import config from '@automattic/calypso-config';
import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { Site } from '@automattic/data-stores';
import { isBlankCanvasDesign } from '@automattic/design-picker';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import { mapRecordKeysRecursively, camelToSnakeCase } from '@automattic/js-utils';
import debugFactory from 'debug';
import { defer, difference, get, includes, isEmpty, pick, startsWith } from 'lodash';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	updatePrivacyForDomain,
	supportsPrivacyProtectionPurchase,
	planItem as getCartItemForPlan,
} from 'calypso/lib/cart-values/cart-items';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';
import { isValidLandingPageVertical } from 'calypso/lib/signup/verticals';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import flows from 'calypso/signup/config/flows';
import steps from 'calypso/signup/config/steps';
import {
	getCurrentUserName,
	isUserLoggedIn,
	getCurrentUser,
} from 'calypso/state/current-user/selectors';
import { buildDIFMCartExtrasObject } from 'calypso/state/difm/assemblers';
import { errorNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { getSiteTitle } from 'calypso/state/signup/steps/site-title/selectors';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import {
	getSiteVerticalId,
	getSiteVerticalName,
} from 'calypso/state/signup/steps/site-vertical/selectors';
import { getSurveyVertical, getSurveySiteType } from 'calypso/state/signup/steps/survey/selectors';
import { getWebsiteContent } from 'calypso/state/signup/steps/website-content/selectors';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteId } from 'calypso/state/sites/selectors';

const Visibility = Site.Visibility;
const debug = debugFactory( 'calypso:signup:step-actions' );

export function createSiteOrDomain( callback, dependencies, data, reduxStore ) {
	const { siteId, siteSlug } = data;
	const { cartItem, designType, siteUrl, themeSlugWithRepo } = dependencies;
	const reduxState = reduxStore.getState();
	const domainItem = dependencies.domainItem
		? prepareItemForAddingToCart(
				addPrivacyProtectionIfSupported( dependencies.domainItem, reduxState )
		  )
		: null;

	if ( designType === 'domain' ) {
		const cartKey = 'no-site';
		const providedDependencies = {
			siteId: null,
			siteSlug: cartKey,
			themeSlugWithRepo: null,
			domainItem,
		};

		const domainChoiceCart = [ domainItem ].filter( Boolean );
		cartManagerClient
			.forCartKey( cartKey )
			.actions.replaceProductsInCart( domainChoiceCart )
			.then( () => callback( undefined, providedDependencies ) )
			.catch( ( error ) => {
				debug( 'product replace request had an error', error );
				reduxStore.dispatch( errorNotice( error.message ) );
				callback( error, providedDependencies );
			} );
	} else if ( designType === 'existing-site' ) {
		const providedDependencies = {
			siteId,
			siteSlug,
		};
		const products = [ dependencies.domainItem, dependencies.privacyItem, dependencies.cartItem ]
			.filter( Boolean )
			.map( ( item ) => prepareItemForAddingToCart( item ) );

		cartManagerClient
			.forCartKey( siteId )
			.actions.replaceProductsInCart( products )
			.then( () => callback( undefined, providedDependencies ) )
			.catch( ( error ) => {
				debug( 'product replace request had an error', error );
				reduxStore.dispatch( errorNotice( error.message ) );
				callback( error, providedDependencies );
			} );
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
	themeSlugWithRepo,
	siteUrl,
	state,
} ) {
	const signupDependencies = getSignupDependencyStore( state );
	const designType = getDesignType( state ).trim();
	const siteTitle = getSiteTitle( state ).trim() || ( signupDependencies?.siteTitle || '' ).trim();
	const siteVerticalId = getSiteVerticalId( state );
	const siteVerticalName = getSiteVerticalName( state );
	const siteType = getSiteType( state ).trim();
	const siteSegment = getSiteTypePropertyValue( 'slug', siteType, 'id' );
	const siteTypeTheme = getSiteTypePropertyValue( 'slug', siteType, 'theme' );
	const selectedDesign = get( signupDependencies, 'selectedDesign', false );

	const forceAutoGeneratedBlogName = signupDependencies?.forceAutoGeneratedBlogName;
	const shouldHideFreePlan = get( signupDependencies, 'shouldHideFreePlan', false );
	const useAutoGeneratedBlogName = shouldHideFreePlan || forceAutoGeneratedBlogName;

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
		public: Visibility.PublicNotIndexed,
		options: {
			designType: designType || undefined,
			theme,
			use_theme_annotation: get( signupDependencies, 'useThemeHeadstart', false ),
			default_annotation_as_primary_fallback: shouldUseDefaultAnnotationAsFallback,
			site_segment: siteSegment || undefined,
			site_vertical: siteVerticalId || undefined,
			site_vertical_name: siteVerticalName || undefined,
			site_information: {
				title: siteTitle,
			},
			site_creation_flow: flowToCheck,
			timezone_string: guessTimezone(),
			wpcom_public_coming_soon: 1,
		},
		validate: false,
	};

	if ( useAutoGeneratedBlogName ) {
		newSiteParams.blog_name =
			siteTitle ||
			getCurrentUserName( state ) ||
			get( signupDependencies, 'username' ) ||
			siteType ||
			getSiteVertical( state );
		newSiteParams.find_available_url = true;
	} else {
		newSiteParams.blog_name = siteUrl;
		newSiteParams.find_available_url = !! isPurchasingDomainItem;
	}

	if ( selectedDesign ) {
		// If there's a selected design, it means that the current flow contains the "design" step.
		newSiteParams.options.theme = `pub/${ selectedDesign.theme }`;
		newSiteParams.options.template = selectedDesign.template;
		newSiteParams.options.use_patterns = true;
		newSiteParams.options.is_blank_canvas = isBlankCanvasDesign( selectedDesign );

		if ( selectedDesign.fonts ) {
			newSiteParams.options.font_base = selectedDesign.fonts.base;
			newSiteParams.options.font_headings = selectedDesign.fonts.headings;
		}
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

	const locale = getLocaleSlug();

	wpcom.req.post(
		'/sites/new',
		{
			...newSiteParams,
			locale,
			lang_id: getLanguage( locale ).value,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		},
		function ( error, response ) {
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
		}
	);
}

export function setThemeOnSite( callback, { siteSlug, themeSlugWithRepo } ) {
	if ( isEmpty( themeSlugWithRepo ) ) {
		defer( callback );
		return;
	}

	const theme = themeSlugWithRepo.split( '/' )[ 1 ];

	wpcom.req
		.post( `/sites/${ siteSlug }/themes/mine`, { theme } )
		.then( () => callback() )
		.catch( ( error ) => callback( [ error ] ) );
}

function addDIFMLiteToCart( callback, dependencies, step, reduxStore ) {
	const { selectedDesign, selectedSiteCategory, isLetUsChooseSelected, siteSlug } = dependencies;
	const extra = buildDIFMCartExtrasObject( dependencies );
	const cartItem = { product_slug: WPCOM_DIFM_LITE, extra };
	const providedDependencies = {
		selectedDesign,
		selectedSiteCategory,
		isLetUsChooseSelected,
		siteSlug,
		cartItem,
	};
	const newCartItems = [ cartItem ];
	processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, null, null );
}

/**
 * If the user chooses DIFM Lite for a new site, then
 * create a new site, call the `setDesignOnSite` function (see below)
 * and add the DIFM Lite product to the cart.
 * If the user chooses DIFM Lite for an existing site, then
 * just add the DIFM Lite product to the cart.
 */
export function setDIFMLiteDesign( callback, dependencies, step, reduxStore ) {
	const signupDependencies = getSignupDependencyStore( reduxStore.getState() );
	const { newOrExistingSiteChoice } = signupDependencies;

	const providedDependencies = { ...signupDependencies, ...dependencies };

	if ( 'new-site' === newOrExistingSiteChoice ) {
		let siteSlug = null;

		const setDesignOnSiteCallback = ( error ) => {
			if ( error ) {
				callback( error );
				return;
			}
			addDIFMLiteToCart( callback, { ...providedDependencies, siteSlug }, step, reduxStore );
		};

		const createSiteWithCartCallback = ( error, result ) => {
			if ( error ) {
				callback( error );
				return;
			}
			siteSlug = result.siteSlug;
			setDesignOnSite( setDesignOnSiteCallback, { ...providedDependencies, siteSlug } );
		};

		createSiteWithCart( createSiteWithCartCallback, providedDependencies, step, reduxStore );
	} else {
		addDIFMLiteToCart( callback, providedDependencies, step, reduxStore );
	}
}

export function submitWebsiteContent( callback, { siteSlug }, step, reduxStore ) {
	const state = reduxStore.getState();
	const websiteContent = getWebsiteContent( state );
	if ( ! websiteContent ) {
		defer( callback );
		return;
	}
	const { pages, siteLogoUrl: site_logo_url } = websiteContent;
	const pagesDTO = pages.map( ( page ) => mapRecordKeysRecursively( page, camelToSnakeCase ) );

	wpcom.req
		.post( {
			path: `/sites/${ siteSlug }/do-it-for-me/website-content`,
			apiNamespace: 'wpcom/v2',
			body: { pages: pagesDTO, site_logo_url },
		} )
		.then( () => reduxStore.dispatch( requestSite( siteSlug ) ) )
		.then( () => callback() )
		.catch( ( error ) => {
			reduxStore.dispatch( errorNotice( error.message ) );
			callback( [ error ] );
		} );
}

export function setDesignOnSite( callback, { siteSlug, selectedDesign } ) {
	if ( ! selectedDesign ) {
		defer( callback );
		return;
	}

	const { theme } = selectedDesign;

	wpcom.req
		.post( `/sites/${ siteSlug }/themes/mine`, { theme, dont_change_homepage: true } )
		.then( () =>
			wpcom.req.post( {
				path: `/sites/${ siteSlug }/theme-setup`,
				apiNamespace: 'wpcom/v2',
				body: { trim_content: true },
			} )
		)
		.then( () =>
			wpcom.req.get( {
				path: `/sites/${ siteSlug }/block-editor`,
				apiNamespace: 'wpcom/v2',
			} )
		)
		.then( ( data ) => {
			callback( null, { isFSEActive: data?.is_fse_active ?? false } );
		} )
		.catch( ( errors ) => {
			callback( [ errors ] );
		} );
}

export function setOptionsOnSite( callback, { siteSlug, siteTitle, tagline } ) {
	if ( ! siteTitle && ! tagline ) {
		defer( callback );
		return;
	}

	wpcom.req.post(
		`/sites/${ siteSlug }/settings`,
		{ apiVersion: '1.4' },
		{
			blogname: siteTitle,
			blogdescription: tagline,
		},
		function ( errors ) {
			callback( isEmpty( errors ) ? undefined : [ errors ] );
		}
	);
}

export function setStoreFeatures( callback, { siteSlug } ) {
	if ( ! siteSlug ) {
		defer( callback );
		return;
	}

	wpcom.req
		.post( {
			path: `/sites/${ siteSlug }/seller_footer`,
			apiNamespace: 'wpcom/v2',
		} )
		.then( () => callback() )
		.catch( ( errors ) => {
			callback( [ errors ] );
		} );
}

export function setIntentOnSite( callback, { siteSlug, intent } ) {
	if ( ! intent ) {
		defer( callback );
		return;
	}

	wpcom.req
		.post( {
			path: `/sites/${ siteSlug }/site-intent`,
			apiNamespace: 'wpcom/v2',
			body: { site_intent: intent },
		} )
		.then( () => callback() )
		.catch( ( errors ) => {
			callback( [ errors ] );
		} );
}

export function addPlanToCart( callback, dependencies, stepProvidedItems, reduxStore ) {
	// Note that we pull in emailItem to avoid race conditions from multiple step API functions
	// trying to fetch and update the cart simultaneously, as both of those actions are asynchronous.
	const { emailItem, siteSlug } = dependencies;
	const { cartItem } = stepProvidedItems;
	if ( isEmpty( cartItem ) && isEmpty( emailItem ) ) {
		// the user selected the free plan
		defer( callback );

		return;
	}

	const providedDependencies = { cartItem };
	const newCartItems = [ cartItem, emailItem ].filter( ( item ) => item );

	processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, null, null );
}
export function addAddOnsToCart(
	callback,
	dependencies,
	stepProvidedItems,
	reduxStore,
	siteSlug,
	stepProvidedDependencies
) {
	const slug = siteSlug || dependencies.siteSlug;
	const { cartItem } = stepProvidedItems;

	const providedDependencies = stepProvidedDependencies || { cartItem };
	if ( ! cartItem || isEmpty( cartItem ) ) {
		// the user hans't selected any addons
		defer( callback );

		return;
	}

	const newCartItems = cartItem.filter( ( item ) => item );
	processItemCart( providedDependencies, newCartItems, callback, reduxStore, slug, null, null );
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
	const addToCartAndProceed = async () => {
		debug( 'preparing to add cart items (if any) from', newCartItems );
		const reduxState = reduxStore.getState();
		const newCartItemsToAdd = newCartItems
			.map( ( item ) => addPrivacyProtectionIfSupported( item, reduxState ) )
			.map( ( item ) => prepareItemForAddingToCart( item ) );

		if ( newCartItemsToAdd.length ) {
			debug( 'adding products to cart', newCartItemsToAdd );
			const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );
			cartManagerClient
				.forCartKey( cartKey )
				.actions.addProductsToCart( newCartItemsToAdd )
				.then( ( updatedCart ) => {
					debug( 'product add request complete', updatedCart );
					callback( undefined, providedDependencies );
				} )
				.catch( ( error ) => {
					debug( 'product add request had an error', error );
					reduxStore.dispatch( errorNotice( error.message ) );
					callback( error, providedDependencies );
				} );
		} else {
			debug( 'no cart items to add' );
			callback( undefined, providedDependencies );
		}
	};

	const userLoggedIn = isUserLoggedIn( reduxStore.getState() );

	if ( ! userLoggedIn && isFreeThemePreselected ) {
		setThemeOnSite( addToCartAndProceed, { siteSlug, themeSlugWithRepo } );
	} else if ( userLoggedIn && isFreeThemePreselected ) {
		fetchSitesAndUser(
			siteSlug,
			setThemeOnSite.bind( null, addToCartAndProceed, { siteSlug, themeSlugWithRepo } ),
			reduxStore
		);
	} else if ( userLoggedIn && siteSlug ) {
		fetchSitesAndUser( siteSlug, addToCartAndProceed, reduxStore );
	} else {
		addToCartAndProceed();
	}
}

function prepareItemForAddingToCart( item ) {
	return {
		...item,
		extra: {
			...item.extra,
			context: 'signup',
		},
	};
}

function addPrivacyProtectionIfSupported( item, state ) {
	const { product_slug: productSlug } = item;
	const productsList = getProductsList( state );
	if (
		productSlug &&
		productsList &&
		supportsPrivacyProtectionPurchase( productSlug, productsList )
	) {
		return updatePrivacyForDomain( item, true );
	}

	return item;
}

export function launchSiteApi( callback, dependencies ) {
	const { siteSlug } = dependencies;

	wpcom.req
		.post( `/sites/${ siteSlug }/launch` )
		.then( () => callback( null ) )
		.catch( ( error ) => callback( error ) );
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

		// Handling special case where users log in via social using signup form.
		let newAccountCreated = true;

		if ( signupType === SIGNUP_TYPE_SOCIAL && response && ! response.created_account ) {
			newAccountCreated = false;
		}

		// we should either have an error with an error property, or we should have a response with a bearer_token
		const bearerToken = {};
		if ( response && response.bearer_token ) {
			bearerToken.bearer_token = response.bearer_token;
		} else {
			// something odd happened...
			// eslint-disable-next-line no-console
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

		const plans_reorder_abtest_variation = response?.plans_reorder_abtest_variation ?? '';

		// Fire tracking events, but only after a _new_ user registers.
		if ( newAccountCreated ) {
			recordRegistration( {
				userData: registrationUserData,
				flow: flowName,
				type: signupType,
			} );
		}

		const providedDependencies = {
			username,
			marketing_price_group,
			plans_reorder_abtest_variation,
			...bearerToken,
		};

		if ( signupType === SIGNUP_TYPE_DEFAULT && oauth2Signup ) {
			Object.assign( providedDependencies, {
				oauth2_client_id: queryArgs.oauth2_client_id,
				oauth2_redirect: get( response, 'oauth2_redirect', '' ).split( '@' )[ 1 ],
			} );
		}

		callback( undefined, providedDependencies );
	};

	if ( service ) {
		// We're creating a new social account
		wpcom.req.post(
			'/users/social/new',
			{
				service,
				access_token,
				id_token,
				signup_flow_name: flowName,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				...userData,
				tos: getToSAcceptancePayload(),
			},
			responseHandler( SIGNUP_TYPE_SOCIAL )
		);
	} else {
		wpcom.req.post(
			'/users/new',
			Object.assign(
				{},
				userData,
				{
					validate: false,
					signup_flow_name: flowName,
					nux_q_site_type: surveySiteType,
					nux_q_question_primary: siteVertical,
					// url sent in the confirmation email
					jetpack_redirect: queryArgs.jetpack_redirect,
					locale: getLocaleSlug(),
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					tos: getToSAcceptancePayload(),
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
	const locale = getLocaleSlug();

	const data = {
		blog_name: site,
		blog_title: '',
		public: Visibility.PublicNotIndexed,
		options: {
			theme: themeSlugWithRepo,
			timezone_string: guessTimezone(),
			wpcom_public_coming_soon: 1,
		},
		validate: false,
		locale,
		lang_id: getLanguage( locale ).value,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	};

	wpcom.req.post( '/sites/new', data, function ( errors, response ) {
		let providedDependencies;
		let siteSlug;

		if ( response && response.blog_details ) {
			const parsedBlogURL = getUrlParts( response.blog_details.url );
			siteSlug = parsedBlogURL.hostname;

			providedDependencies = { siteSlug };
		}

		if ( isUserLoggedIn( reduxStore.getState() ) && isEmpty( errors ) ) {
			fetchSitesAndUser( siteSlug, () => callback( undefined, providedDependencies ), reduxStore );
		} else {
			callback( isEmpty( errors ) ? undefined : [ errors ], providedDependencies );
		}
	} );
}

export function createVideoPressSite( callback, dependencies, data, reduxStore ) {
	const { siteId, siteSlug } = data;
	const { cartItem, designType, siteUrl, themeSlugWithRepo } = dependencies;
	const reduxState = reduxStore.getState();
	const domainItem = dependencies.domainItem
		? prepareItemForAddingToCart(
				addPrivacyProtectionIfSupported( dependencies.domainItem, reduxState )
		  )
		: null;

	if ( designType === 'domain' ) {
		const cartKey = 'no-site';
		const providedDependencies = {
			siteId: null,
			siteSlug: cartKey,
			themeSlugWithRepo: '',
			domainItem,
		};

		const domainChoiceCart = [ domainItem ].filter( Boolean );
		cartManagerClient
			.forCartKey( cartKey )
			.actions.replaceProductsInCart( domainChoiceCart )
			.then( () => callback( undefined, providedDependencies ) )
			.catch( ( error ) => {
				debug( 'product replace request had an error', error );
				reduxStore.dispatch( errorNotice( error.message ) );
				callback( error, providedDependencies );
			} );
	} else if ( designType === 'existing-site' ) {
		const providedDependencies = {
			siteId,
			siteSlug,
		};
		const products = [ dependencies.domainItem, dependencies.privacyItem, dependencies.cartItem ]
			.filter( Boolean )
			.map( ( item ) => prepareItemForAddingToCart( item ) );

		cartManagerClient
			.forCartKey( siteId )
			.actions.replaceProductsInCart( products )
			.then( () => callback( undefined, providedDependencies ) )
			.catch( ( error ) => {
				debug( 'product replace request had an error', error );
				reduxStore.dispatch( errorNotice( error.message ) );
				callback( error, providedDependencies );
			} );
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
export function createWpForTeamsSite( callback, dependencies, stepData, reduxStore ) {
	const { site, siteTitle } = stepData;

	// The new p2 theme for WP for Teams project.
	// More info: https://wp.me/p9lv3a-1dm-p2
	const themeSlugWithRepo = 'pub/p2020';

	const locale = getLocaleSlug();

	const data = {
		blog_name: site,
		blog_title: siteTitle,
		public: -1, // wp for teams sites are not supposed to be public
		options: {
			theme: themeSlugWithRepo,
			timezone_string: guessTimezone(),
			is_wpforteams_site: true,
			p2_initialize_as_hub: true,
			...( stepData.campaign && { p2_signup_campaign: stepData.campaign } ),
		},
		validate: false,
		locale,
		lang_id: getLanguage( locale ).value,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	};

	wpcom.req.post( '/sites/new', data, function ( errors, response ) {
		let providedDependencies;
		let siteSlug;

		if ( response && response.blog_details ) {
			const parsedBlogURL = getUrlParts( response.blog_details.url );
			siteSlug = parsedBlogURL.hostname;

			providedDependencies = { siteSlug };
		}

		if ( isUserLoggedIn( reduxStore.getState() ) && isEmpty( errors ) ) {
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

export function maybeExcludeEmailsStep( {
	domainItem,
	resetSignupStep,
	siteUrl,
	stepName,
	submitSignupStep,
} ) {
	const isEmailStepExcluded = flows.excludedSteps.includes( stepName );

	/* If we have a domain, make sure the step isn't excluded */
	if ( domainItem ) {
		if ( ! isEmailStepExcluded ) {
			return;
		}

		resetSignupStep( stepName );
		flows.resetExcludedStep( stepName );

		return;
	}

	/* We don't have a domain, so exclude the step if it hasn't been excluded yet */
	if ( isEmailStepExcluded ) {
		return;
	}

	const emailItem = undefined;

	submitSignupStep( { stepName, emailItem, wasSkipped: true }, { emailItem } );

	recordExcludeStepEvent( stepName, siteUrl );

	flows.excludeStep( stepName );
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

export function excludeStepIfEmailVerified( stepName, defaultDependencies, nextProps ) {
	if ( includes( flows.excludedSteps, stepName ) ) {
		return;
	}

	/* For the P2 signup flow, if we displayed the email verification step before,
	   we need to display it again when the user comes back to the flow
	   after verification. */
	if ( nextProps.flowName === 'p2' && nextProps?.progress[ stepName ]?.status === 'in-progress' ) {
		debug( 'User email verification is in progress, do not skip this step' );
		return;
	}

	debug( 'User email is verified: %s', nextProps?.isEmailVerified );
	if ( ! nextProps.isEmailVerified ) {
		return;
	}

	debug( 'Skipping P2 email confirmation step' );
	recordTracksEvent( 'calypso_signup_p2_confirm_email_autoskip' );
	nextProps.submitSignupStep( { stepName, wasSkipped: true } );
	flows.excludeStep( stepName );
}

export function excludeStepIfProfileComplete( stepName, defaultDependencies, nextProps ) {
	if ( includes( flows.excludedSteps, stepName ) ) {
		return;
	}

	const state = nextProps?.store?.getState();

	if ( ! state ) {
		return;
	}

	const currentUser = getCurrentUser( state );
	debug( 'Checking profile for current user', currentUser );
	if ( currentUser?.display_name !== currentUser?.username ) {
		debug( 'Skipping P2 complete profile step' );
		recordTracksEvent( 'calypso_signup_p2_complete_profile_autoskip' );
		nextProps.submitSignupStep( { stepName, wasSkipped: true } );
		flows.excludeStep( stepName );
	}
}

export function isAddOnsFulfilled( stepName, defaultDependencies, nextProps ) {
	const { store, submitSignupStep } = nextProps;

	const state = store.getState();
	const cartItem = get( getSignupDependencyStore( state ), 'cartItem', null );
	let fulfilledDependencies = [];

	if ( cartItem ) {
		submitSignupStep( { stepName, cartItem: [], wasSkipped: true }, { cartItem: [] } );
		fulfilledDependencies = [ 'cartItem' ];
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
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

	const flowSteps = flows.getFlow( flowName, nextProps.isLoggedIn ).steps;
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

/**
 * Skip the step if the user does not have any existing sites
 */
export function isNewOrExistingSiteFulfilled( stepName, defaultDependencies, nextProps ) {
	const { existingSiteCount, submitSignupStep } = nextProps;
	if ( ! existingSiteCount || 0 === existingSiteCount ) {
		const stepProvidesDependency =
			steps[ stepName ].providesDependencies.includes( 'newOrExistingSiteChoice' );
		let dependency = undefined;
		if ( stepProvidesDependency ) {
			dependency = {
				newOrExistingSiteChoice: 'new-site',
				forceAutoGeneratedBlogName: true,
			};
		}
		submitSignupStep( { stepName, wasSkipped: true }, dependency );
		recordExcludeStepEvent( stepName );
		flows.excludeStep( stepName );
	}
}
