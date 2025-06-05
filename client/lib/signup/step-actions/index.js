import { getTracksAnonymousUserId, recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { WPCOM_DIFM_LITE, PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { Site, AddOns } from '@automattic/data-stores';
import { STORAGE_ADD_ONS } from '@automattic/data-stores/src/add-ons';
import { getAddOn } from '@automattic/data-stores/src/add-ons/add-ons-list';
import { isBlankCanvasDesign } from '@automattic/design-picker';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import debugFactory from 'debug';
import { defer, difference, get, includes, isEmpty, pick, startsWith } from 'lodash';
import { buildUpgradeFunction } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/util';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import {
	updatePrivacyForDomain,
	supportsPrivacyProtectionPurchase,
	planItem as getCartItemForPlan,
	marketplaceThemeProduct,
	getPlanCartItem,
} from 'calypso/lib/cart-values/cart-items';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wpcom from 'calypso/lib/wp';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import flows from 'calypso/signup/config/flows';
import steps from 'calypso/signup/config/steps';
import { getCurrentUserName, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	buildDIFMCartExtrasObject,
	buildDIFMWebsiteContentRequestDTO,
} from 'calypso/state/difm/assemblers';
import { errorNotice } from 'calypso/state/notices/actions';
import { requestProductsList } from 'calypso/state/products-list/actions';
import {
	getProductBySlug,
	getProductsByBillingSlug,
	getProductsList,
	getMarketplaceProducts,
	getProductBillingSlugByThemeId,
} from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { getWebsiteContent } from 'calypso/state/signup/steps/website-content/selectors';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
import { THEMES_LOADING_CART } from 'calypso/state/themes/action-types';
import { requestTheme } from 'calypso/state/themes/actions';
import { isExternallyManagedTheme as getIsExternallyManagedTheme } from 'calypso/state/themes/selectors';

const Visibility = Site.Visibility;
const debug = debugFactory( 'calypso:signup:step-actions' );

export function createSiteOrDomain( callback, dependencies, data, reduxStore ) {
	const { siteId, siteSlug } = data;
	const { cartItem, domainCart, designType, siteUrl, themeSlugWithRepo } = dependencies;
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

		const domainChoiceCart =
			domainCart && domainCart.length > 0
				? domainCart.filter( Boolean )
				: [ domainItem ].filter( Boolean );

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

		const products =
			domainCart && domainCart.length > 0
				? [ ...Object.values( domainCart ), dependencies.privacyItem, dependencies.cartItem ]
						.filter( Boolean )
						.map( ( item ) => prepareItemForAddingToCart( item ) )
				: [ dependencies.domainItem, dependencies.privacyItem, dependencies.cartItem ]
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
			domainCart,
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

export const getNewSiteParams = ( {
	dependencies,
	flowToCheck,
	isPurchasingDomainItem,
	themeSlugWithRepo,
	siteUrl,
	state,
	siteAccentColor,
} ) => {
	const signupDependencies = getSignupDependencyStore( state );
	const designType = getDesignType( state ).trim();
	const siteTitle = ( signupDependencies?.siteTitle || '' ).trim();
	const selectedDesign = get( signupDependencies, 'selectedDesign', false );

	const forceAutoGeneratedBlogName = signupDependencies?.forceAutoGeneratedBlogName;
	const useAutoGeneratedBlogName = ! siteUrl || forceAutoGeneratedBlogName;
	// The theme can be provided in this step's dependencies,
	// the step object itself depending on if the theme is provided in a
	// query (see `getThemeSlug` in `DomainsStep`),
	// or the Signup dependency store.
	const theme =
		dependencies.themeSlugWithRepo ||
		themeSlugWithRepo ||
		get( signupDependencies, 'themeSlugWithRepo', false );

	const launchAsComingSoon = get( signupDependencies, 'comingSoon', 1 );

	// We will use the default annotation instead of theme annotation as fallback,
	// when segment and vertical values are not sent. Check pbAok1-p2#comment-834.
	const shouldUseDefaultAnnotationAsFallback = true;

	const newSiteParams = {
		blog_title: siteTitle,
		public: launchAsComingSoon ? Visibility.PublicNotIndexed : Visibility.PublicIndexed,
		options: {
			designType: designType || undefined,
			theme,
			use_theme_annotation: get( signupDependencies, 'useThemeHeadstart', false ),
			default_annotation_as_primary_fallback: shouldUseDefaultAnnotationAsFallback,
			site_information: {
				title: siteTitle,
			},
			site_creation_flow: flowToCheck,
			timezone_string: guessTimezone(),
			wpcom_public_coming_soon: launchAsComingSoon,
			...( siteAccentColor && { site_accent_color: siteAccentColor } ),
		},
		validate: false,
	};

	if ( useAutoGeneratedBlogName ) {
		newSiteParams.blog_name =
			siteTitle || getCurrentUserName( state ) || get( signupDependencies, 'username' ) || '';
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
};

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
		themeStyleVariation,
		themeItem,
		siteAccentColor,
		domainCart,
	} = stepData;

	// flowName isn't always passed in
	const flowToCheck = flowName || lastKnownFlow;

	const newCartItems =
		domainCart && domainCart.length > 0
			? [ ...Object.values( domainCart ), googleAppsCartItem, themeItem ].filter( ( item ) => item )
			: [ domainItem, googleAppsCartItem, themeItem ].filter( ( item ) => item );

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
		siteAccentColor,
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

			processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, {
				isFreeThemePreselected,
				themeSlugWithRepo,
				themeStyleVariation,
			} );
		}
	);
}

export function setThemeOnSite( callback, { siteSlug, themeSlugWithRepo, themeStyleVariation } ) {
	if ( isEmpty( themeSlugWithRepo ) ) {
		defer( callback );
		return;
	}

	const theme = themeSlugWithRepo.split( '/' )[ 1 ];

	wpcom.req
		.post( `/sites/${ siteSlug }/themes/mine`, {
			theme,
			...( themeStyleVariation && { style_variation_slug: themeStyleVariation } ),
		} )
		.then( () => callback() )
		.catch( ( error ) => callback( [ error ] ) );
}

function addDIFMLiteProductToCart( callback, dependencies, step, reduxStore ) {
	const { selectedDesign, selectedSiteCategory, isLetUsChooseSelected, siteSlug, siteId } =
		dependencies;
	if ( step.lastKnownFlow === 'do-it-for-me-store' ) {
		dependencies.isStoreFlow = true;
	}

	const selectedSiteId = siteId || getSiteId( reduxStore.getState(), siteSlug );

	const extra = buildDIFMCartExtrasObject(
		dependencies,
		selectedSiteId,
		`step-actions-flow-${ step.lastKnownFlow || '' }`
	);
	const cartItem = {
		product_slug: WPCOM_DIFM_LITE,
		extra,
	};

	cartItem.quantity = dependencies.selectedPageTitles.length;

	const providedDependencies = {
		selectedDesign,
		selectedSiteCategory,
		isLetUsChooseSelected,
		siteSlug,
		cartItem,
	};
	const newCartItems = [ cartItem ];

	const logErrorIfExistsCallback = ( error, result ) => {
		if ( error ) {
			logToLogstash( {
				feature: 'calypso_client',
				message: error?.message || '',
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				properties: {
					type: 'calypso_bbe_process_item_cart_error',
					flow: step.lastKnownFlow,
					dependencies: JSON.stringify( providedDependencies ),
				},
			} );
			callback( error );
			return;
		}
		callback( error, result );
	};

	processItemCart(
		providedDependencies,
		newCartItems,
		logErrorIfExistsCallback,
		reduxStore,
		siteSlug
	);
}

/**
 * If the user chooses DIFM Lite (BBE) for a new site, then
 * create a new site, and add the DIFM Lite (BBE) product to the cart.
 * If the user chooses DIFM Lite (BBE) for an existing site, then
 * just add the DIFM Lite (BBE) product to the cart.
 */
export function createSiteAndAddDIFMToCart( callback, dependencies, step, reduxStore ) {
	const signupDependencies = getSignupDependencyStore( reduxStore.getState() );
	const { newOrExistingSiteChoice } = signupDependencies;

	const providedDependencies = { ...signupDependencies, ...dependencies };

	if ( 'new-site' === newOrExistingSiteChoice ) {
		let siteSlug = null;

		const createSiteWithCartCallback = ( error, result ) => {
			if ( error ) {
				logToLogstash( {
					feature: 'calypso_client',
					message: error?.message || '',
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					properties: {
						type: 'calypso_bbe_create_site_with_cart_error',
						flow: step.lastKnownFlow,
						dependencies: JSON.stringify( providedDependencies ),
					},
				} );
				callback( error );
				return;
			}
			siteSlug = result.siteSlug;
			addDIFMLiteProductToCart(
				callback,
				{ ...providedDependencies, siteSlug, siteId: result.siteId },
				step,
				reduxStore
			);
		};

		createSiteWithCart( createSiteWithCartCallback, providedDependencies, step, reduxStore );
	} else {
		addDIFMLiteProductToCart( callback, providedDependencies, step, reduxStore );
	}
}

export function submitWebsiteContent( callback, { siteSlug }, step, reduxStore ) {
	const state = reduxStore.getState();
	const websiteContent = getWebsiteContent( state );
	if ( ! websiteContent ) {
		defer( callback );
		return;
	}

	const websiteContentRequestDTO = buildDIFMWebsiteContentRequestDTO( websiteContent );

	wpcom.req
		.post( {
			path: `/sites/${ siteSlug }/do-it-for-me/website-content`,
			apiNamespace: 'wpcom/v2',
			body: websiteContentRequestDTO,
		} )
		.then( () => reduxStore.dispatch( requestSite( siteSlug ) ) )
		.then( () => callback() )
		.catch( ( error ) => {
			reduxStore.dispatch( errorNotice( error.message ) );
			callback( [ error ] );
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

function findMarketplacePlugin( state, pluginSlug, billingPeriod = '' ) {
	const plugins = getMarketplaceProducts( state, pluginSlug );
	const billingPeriodToTerm = {
		MONTHLY: 'month',
		ANNUALLY: 'year',
	};
	const term = ( billingPeriod && billingPeriodToTerm[ billingPeriod ] ) || '';

	if ( ! term ) {
		return plugins?.[ 0 ] || null;
	}

	return plugins?.find( ( plugin ) => plugin.product_term === term ) || null;
}

export function addWithThemePlanToCart( callback, dependencies, stepProvidedItems, reduxStore ) {
	const { cartItems } = stepProvidedItems;
	const planCartItem = getPlanCartItem( cartItems );
	/**
	 * If the user selected the free option, then we should abort the checkout part.
	 */
	if ( ! planCartItem ) {
		defer( callback );
		return;
	}

	reduxStore.dispatch( requestTheme( dependencies.theme, 'wpcom', getLocaleSlug() ) ).then( () => {
		const state = reduxStore.getState();
		const themeSlug = dependencies.theme;
		const isExternallyManagedTheme = getIsExternallyManagedTheme( state, themeSlug );

		if ( isExternallyManagedTheme ) {
			addExternalManagedThemeToCart(
				state,
				reduxStore.dispatch,
				themeSlug,
				dependencies.siteSlug,
				planCartItem,
				callback,
				{ cartItems: stepProvidedItems.cartItems }
			).then( () => {} );
		} else {
			addPlanToCart( callback, dependencies, stepProvidedItems, reduxStore );
		}
	} );
}

const setIsLoadingCart = ( isLoading ) => ( dispatch ) => {
	dispatch( {
		type: THEMES_LOADING_CART,
		isLoading,
	} );
};

/**
 * Add a Marketplace theme and the Business/eCommerce plan.
 *
 * Based on client/state/themes/actions/add-external-managed-theme-to-cart.tsx.
 *
 * Decided to duplicate the code in order to reduce scope.
 * @param state
 * @param dispatch
 * @param themeId
 * @param siteSlug
 * @param planCartItem
 * @param callback
 * @param providedDependencies
 * @returns {Promise<void>}
 */
async function addExternalManagedThemeToCart(
	state,
	dispatch,
	themeId,
	siteSlug,
	planCartItem,
	callback,
	providedDependencies
) {
	const products = getProductsByBillingSlug(
		state,
		getProductBillingSlugByThemeId( state, themeId )
	);

	if ( undefined === products || products.length === 0 ) {
		// @TODO What kind of logging should we add here? For now it just bails the code.
		return;
	}

	const planProduct = getProductBySlug( state, planCartItem.product_slug );

	let preferredProduct = products.find(
		( product ) => product.product_term === planProduct.product_term
	);

	/**
	 * If no preferred product was found based on the product_term of the plan, default to 'year'.
	 *
	 * This shouldn't happen for now but it could happen in the future for 2y plans or longer term plans.
	 */
	if ( ! preferredProduct ) {
		preferredProduct = products.find( ( product ) => product.product_term === 'year' );
	}

	const productSlug = preferredProduct?.product_slug ?? products[ 0 ].product_slug;

	const externalManagedThemeProduct = marketplaceThemeProduct( productSlug );

	/**
	 * This holds the products that will be added to the cart. We always want to add the
	 * theme product, but we only want to add the business plan if the site is not eligible
	 */
	const cartItems = [ planCartItem, externalManagedThemeProduct ];

	dispatch( setIsLoadingCart( true ) );
	const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );
	cartManagerClient
		.forCartKey( cartKey )
		.actions.addProductsToCart( cartItems )
		.then( () => {
			callback( undefined, providedDependencies );
		} )
		.finally( () => {
			dispatch( setIsLoadingCart( false ) );
		} );
}

export function addWithPluginPlanToCart( callback, dependencies, stepProvidedItems, reduxStore ) {
	const { plugin, billing_period: billingPeriod, siteSlug } = dependencies;
	const { cartItems, lastKnownFlow } = stepProvidedItems;

	reduxStore.dispatch( requestProductsList( { type: 'all' } ) ).then( () => {
		const marketplacePlugin = findMarketplacePlugin( reduxStore.getState(), plugin, billingPeriod );
		const providedDependencies = { cartItems };

		const newCartItems = [ ...( cartItems ? cartItems : [] ), marketplacePlugin ].filter(
			( item ) => item
		);

		processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, {
			lastKnownFlow,
		} );
	} );
}

export function addPlanToCart( callback, dependencies, stepProvidedItems, reduxStore ) {
	// Note that we pull in emailItem to avoid race conditions from multiple step API functions
	// trying to fetch and update the cart simultaneously, as both of those actions are asynchronous.
	const { emailItem, siteSlug } = dependencies;
	const { cartItems, lastKnownFlow } = stepProvidedItems;
	if ( isEmpty( cartItems ) && isEmpty( emailItem ) ) {
		// the user selected the free plan
		defer( callback );

		return;
	}

	const providedDependencies = { cartItems };
	const newCartItems = [ ...( cartItems ? cartItems : [] ), emailItem ].filter( ( item ) => item );
	processItemCart( providedDependencies, newCartItems, callback, reduxStore, siteSlug, {
		lastKnownFlow,
	} );
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
	processItemCart( providedDependencies, newCartItems, callback, reduxStore, slug );
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

	processItemCart( providedDependencies, newCartItems, callback, reduxStore, slug );
}

function processItemCart(
	providedDependencies,
	newCartItems,
	callback,
	reduxStore,
	siteSlug,
	{ isFreeThemePreselected, themeSlugWithRepo, themeStyleVariation, lastKnownFlow } = {}
) {
	const addToCartAndProceed = async () => {
		debug( 'preparing to add cart items (if any) from', newCartItems );
		const reduxState = reduxStore.getState();
		const newCartItemsToAdd = newCartItems
			.map( ( item ) => addPrivacyProtectionIfSupported( item, reduxState ) )
			.map( ( item ) => prepareItemForAddingToCart( item, lastKnownFlow ) );

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
		setThemeOnSite( addToCartAndProceed, { siteSlug, themeSlugWithRepo, themeStyleVariation } );
	} else if ( userLoggedIn && isFreeThemePreselected ) {
		fetchSitesAndUser(
			siteSlug,
			setThemeOnSite.bind( null, addToCartAndProceed, {
				siteSlug,
				themeSlugWithRepo,
				themeStyleVariation,
			} ),
			reduxStore
		);
	} else if ( userLoggedIn && siteSlug ) {
		fetchSitesAndUser( siteSlug, addToCartAndProceed, reduxStore );
	} else {
		addToCartAndProceed();
	}
}

function prepareItemForAddingToCart( item, lastKnownFlow = null ) {
	return {
		...item,
		extra: {
			...item.extra,
			context: 'signup',
			...( lastKnownFlow && { signup_flow: lastKnownFlow } ),
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
	}
) {
	const flowToCheck = flowName || lastKnownFlow;

	if ( 'onboarding-registrationless' === flowToCheck ) {
		const { cartItem, domainItem, cartItems } = dependencies;
		const isPurchasingItem =
			! isEmpty( cartItem ) || ! isEmpty( domainItem ) || ! isEmpty( cartItems );

		// If purchasing item in this flow, return without creating a user account.
		if ( isPurchasingItem ) {
			const providedDependencies = { allowUnauthenticated: true };
			return defer( () => callback( undefined, providedDependencies ) );
		}
	}

	const SIGNUP_TYPE_SOCIAL = 'social';
	const SIGNUP_TYPE_DEFAULT = 'default';

	const params = new URLSearchParams( window.location.search );
	const flowNameTracking =
		null === params.get( 'variationName' )
			? flowName
			: `${ flowName }-${ params.get( 'variationName' ) }`;

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

		// Fire tracking events, but only after a _new_ user registers.
		if ( newAccountCreated ) {
			recordRegistration( {
				userData: registrationUserData,
				flow: flowNameTracking,
				type: signupType,
			} );
		}

		const providedDependencies = {
			username,
			marketing_price_group,
			is_new_account: newAccountCreated,
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
				signup_flow_name: flowNameTracking,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				...userData,
				tos: getToSAcceptancePayload(),
				anon_id: getTracksAnonymousUserId(),
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
					signup_flow_name: flowNameTracking,
					// url sent in the confirmation email
					jetpack_redirect: queryArgs.jetpack_redirect,
					locale: getLocaleSlug(),
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					tos: getToSAcceptancePayload(),
					anon_id: getTracksAnonymousUserId(),
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
	const { site, themeSlugWithRepo } = stepData;
	const signupDependencies = getSignupDependencyStore( reduxStore.getState() );
	const locale = getLocaleSlug();

	const theme =
		dependencies?.themeSlugWithRepo ||
		themeSlugWithRepo ||
		get( signupDependencies, 'themeSlugWithRepo', false );

	const data = {
		blog_name: site,
		blog_title: '',
		public: Visibility.PublicNotIndexed,
		options: {
			theme,
			timezone_string: guessTimezone(),
			wpcom_public_coming_soon: 1,
		},
		validate: false,
		locale,
		lang_id: getLanguage( locale ).value,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	};

	// ************************************************************************
	// ****  Experiment skeleton left in for future BBE copy change tests  ****
	// ************************************************************************
	// Pre Load Experiment relevant to the post site creation goal screen
	// loadExperimentAssignment( CALYPSO_BUILTBYEXPRESS_GOAL_TEXT_EXPERIMENT_NAME );

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
	const domainCart = undefined;

	submitSignupStep( { stepName, domainItem }, { domainItem, domainCart } );
	recordExcludeStepEvent( stepName, tracksEventValue );

	fulfilledDependencies = [ 'domainItem', 'domainCart', 'siteId', 'siteSlug', 'themeItem' ];

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

export function maybeAddStorageAddonToCart( stepName, defaultDependencies, nextProps ) {
	const { submitSignupStep, sitePlanSlug, store } = nextProps;
	const fulfilledDependencies = [];
	const cartItem = [];

	const state = store.getState();
	const selectedStorage = get( getSignupDependencyStore( state ), 'storage', null );

	if ( STORAGE_ADD_ONS.includes( selectedStorage ) ) {
		const selectedAddOn = getAddOn( selectedStorage );
		cartItem.push( {
			product_slug: PRODUCT_1GB_SPACE,
			quantity: selectedAddOn.quantity,
			volume: 1,
			extra: { feature_slug: AddOns.ADD_ON_50GB_STORAGE },
		} );
		recordTracksEvent( 'calypso_signup_storage_add_on_selected', {
			add_on_slug: selectedAddOn.addOnSlug,
		} );
	}

	submitSignupStep( { stepName, cartItem, wasSkipped: true }, { cartItem } );
	fulfilledDependencies.push( 'cartItems' );

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
		recordExcludeStepEvent( stepName, sitePlanSlug );
	}
}

export function isPlanFulfilled( stepName, defaultDependencies, nextProps ) {
	const { isPaidPlan, sitePlanSlug, submitSignupStep } = nextProps;
	const fulfilledDependencies = [];
	const dependenciesFromDefaults = {};

	// Check for plan-specific default theme
	if ( defaultDependencies && defaultDependencies.themeSlugWithRepo ) {
		fulfilledDependencies.push( 'themeSlugWithRepo' );
		dependenciesFromDefaults.themeSlugWithRepo = defaultDependencies.themeSlugWithRepo;
	}

	if ( isPaidPlan ) {
		const cartItems = undefined;
		submitSignupStep(
			{ stepName, cartItems, wasSkipped: true },
			{ cartItems, ...dependenciesFromDefaults }
		);
		recordExcludeStepEvent( stepName, sitePlanSlug );
		fulfilledDependencies.push( 'cartItems' );
	} else if ( defaultDependencies && defaultDependencies.cartItem ) {
		const cartItems = [ getCartItemForPlan( defaultDependencies.cartItem ) ];
		submitSignupStep(
			{ stepName, cartItems, wasSkipped: true },
			{ cartItems, ...dependenciesFromDefaults }
		);
		recordExcludeStepEvent( stepName, defaultDependencies.cartItem );
		fulfilledDependencies.push( 'cartItems' );
	}

	if ( shouldExcludeStep( stepName, fulfilledDependencies ) ) {
		flows.excludeStep( stepName );
	}
}

export { buildUpgradeFunction };
