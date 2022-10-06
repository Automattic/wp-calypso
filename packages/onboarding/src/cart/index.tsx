import { get, startsWith } from 'lodash';
import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import wpcom from 'calypso/lib/wp';
import { getSiteId } from 'calypso/state/sites/selectors';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import { Site } from '@automattic/data-stores';
import { isBlankCanvasDesign } from '@automattic/design-picker';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import debugFactory from 'debug';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';
import { setupSiteAfterCreation, isTailoredSignupFlow } from '@automattic/onboarding';
import { errorNotice } from 'calypso/state/notices/actions';
import e from 'express';
import { connect } from 'react-redux';

const Visibility = Site.Visibility;
const debug = debugFactory( 'calypso:signup:step-actions' );

export const getNewSiteParams = ( {
	dependencies,
	flowToCheck,
	isPurchasingDomainItem,
	themeSlugWithRepo,
	siteUrl,
	siteAccentColor,
} ) => {
	const designType = ''; //getDesignType( state ).trim();
	const siteTitle = ''; //getSiteTitle( state ).trim() || ( signupDependencies?.siteTitle || '' ).trim();
	const siteType = ''; //getSiteType( state ).trim();
	const siteSegment = null; //getSiteTypePropertyValue( 'slug', siteType, 'id' );
	const siteTypeTheme = getSiteTypePropertyValue( 'slug', siteType, 'theme' );
	const selectedDesign = false; //get( signupDependencies, 'selectedDesign', false );

	const forceAutoGeneratedBlogName = undefined; //signupDependencies?.forceAutoGeneratedBlogName;
	const useAutoGeneratedBlogName = ! siteUrl || forceAutoGeneratedBlogName;
	// The theme can be provided in this step's dependencies,
	// the step object itself depending on if the theme is provided in a
	// query (see `getThemeSlug` in `DomainsStep`),
	// or the Signup dependency store. Defaults to site type theme.
	const theme =
		dependencies.themeSlugWithRepo ||
		themeSlugWithRepo ||
		'pub/lynx' || //get( signupDependencies, 'themeSlugWithRepo', false ) ||
		siteTypeTheme;

	const launchAsComingSoon = 1; //get( signupDependencies, 'comingSoon', 1 );

	// We will use the default annotation instead of theme annotation as fallback,
	// when segment and vertical values are not sent. Check pbAok1-p2#comment-834.
	const shouldUseDefaultAnnotationAsFallback = true;

	const newSiteParams = {
		blog_title: siteTitle,
		public: launchAsComingSoon ? Visibility.PublicNotIndexed : Visibility.PublicIndexed,
		options: {
			designType: designType || undefined,
			theme,
			use_theme_annotation: false, //get( signupDependencies, 'useThemeHeadstart', false ),
			default_annotation_as_primary_fallback: shouldUseDefaultAnnotationAsFallback,
			site_segment: siteSegment || undefined,
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
		newSiteParams.blog_name = siteTitle; //|| getCurrentUserName( state ) || get( signupDependencies, 'username' ) || siteType;
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

export default function createSiteWithCart(
	flowToCheck,
	siteSlug,
	isManageSiteFlow,
	domainData,
	userIsLoggedIn,
	shouldHideFreePlan,
	callback
) {
	const {
		domainItem,
		flowName,
		lastKnownFlow,
		googleAppsCartItem,
		isPurchasingItem: isPurchasingDomainItem,
		siteUrl,
		themeSlugWithRepo,
		themeItem,
		siteAccentColor,
	} = domainData;

	const dependencies = {
		isManageSiteFlow,
		shouldHideFreePlan,
	};

	// flowName isn't always passed in
	// const flowToCheck = flowName || lastKnownFlow;
	const newCartItems = [ domainItem, googleAppsCartItem, themeItem ].filter( ( item ) => item );
	const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' ) && ! themeItem;
	// x	const bearerToken = get( getSignupDependencyStore( state ), 'bearer_token', null );

	// const isManageSiteFlow = get( getSignupDependencyStore( state ), 'isManageSiteFlow', false );

	if ( isManageSiteFlow ) {
		//Just for testing
		const siteSlug = 'dsffdsfsdfsdfsdfsd.wordpress.com'; //get( getSignupDependencyStore( state ), 'siteSlug', undefined );
		const siteId = 210841991; //getSiteId( state, siteSlug );
		const providedDependencies = { domainItem, siteId, siteSlug, themeItem };
		addDomainToCart(
			callback,
			dependencies,
			domainData,
			siteSlug,
			providedDependencies,
			userIsLoggedIn
		);
		return;
	}

	const newSiteParams = getNewSiteParams( {
		dependencies,
		flowToCheck,
		isPurchasingDomainItem,
		lastKnownFlow,
		themeSlugWithRepo,
		siteUrl,
		siteAccentColor,
	} );

	// if ( isEmpty( bearerToken ) && 'onboarding-registrationless' === flowToCheck ) {
	// 	saveToLocalStorageAndProceed( state, domainItem, themeItem, newSiteParams, callback );
	// 	return;
	// }

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
				siteSlug,
				isFreeThemePreselected,
				themeSlugWithRepo,
				flowToCheck,
				userIsLoggedIn
			);
			// if ( isTailoredSignupFlow( flowToCheck ) ) {
			// 	setupSiteAfterCreation( { siteId, flowName: flowToCheck } ).then( () => {
			// 		processItemCart(
			// 			providedDependencies,
			// 			newCartItems,
			// 			callback,
			// 			reduxStore,
			// 			siteSlug,
			// 			isFreeThemePreselected,
			// 			themeSlugWithRepo
			// 		);
			// 	} );
			// } else {
			// 	processItemCart(
			// 		providedDependencies,
			// 		newCartItems,
			// 		callback,
			// 		reduxStore,
			// 		siteSlug,
			// 		isFreeThemePreselected,
			// 		themeSlugWithRepo
			// 	);
			// }
		}
	);
}

export function addDomainToCart(
	callback,
	dependencies,
	domainData,
	siteSlug,
	stepProvidedDependencies,
	userIsLoggedIn
) {
	const slug = siteSlug || dependencies.siteSlug;
	const { domainItem, googleAppsCartItem } = domainData;
	const providedDependencies = stepProvidedDependencies || { domainItem };

	const newCartItems = [ domainItem, googleAppsCartItem ].filter( ( item ) => item );

	processItemCart(
		providedDependencies,
		newCartItems,
		callback,
		slug,
		null,
		null,
		null,
		userIsLoggedIn
	);
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

function processItemCart(
	providedDependencies,
	newCartItems,
	callback,
	siteSlug,
	isFreeThemePreselected,
	themeSlugWithRepo,
	lastKnownFlow,
	userIsLoggedIn
) {
	const addToCartAndProceed = async () => {
		debug( 'preparing to add cart items (if any) from', newCartItems );
		// const reduxState = reduxStore.getState();
		const newCartItemsToAdd = newCartItems
			// .map( ( item ) => addPrivacyProtectionIfSupported( item, reduxState ) )
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
					// reduxStore.dispatch( errorNotice( error.message ) );
					callback( error, providedDependencies );
				} );
		} else {
			debug( 'no cart items to add' );
			callback( undefined, providedDependencies );
		}
	};

	addToCartAndProceed();

	// if ( ! userIsLoggedIn && isFreeThemePreselected ) {
	// 	// setThemeOnSite( addToCartAndProceed, { siteSlug, themeSlugWithRepo } );
	// } else if ( userIsLoggedIn && isFreeThemePreselected ) {
	// 	// fetchSitesAndUser(
	// 	// 	siteSlug,
	// 	// 	setThemeOnSite.bind( null, addToCartAndProceed, { siteSlug, themeSlugWithRepo } ),
	// 	// 	reduxStore
	// 	// );
	// } else if ( userIsLoggedIn && siteSlug ) {
	// 	fetchSitesAndUser( siteSlug, addToCartAndProceed, window.reduxStore );
	// } else {
	// 	addToCartAndProceed();
	// }
}
