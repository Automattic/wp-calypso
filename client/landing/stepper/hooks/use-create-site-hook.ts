import config from '@automattic/calypso-config';
import { getLanguage } from '@automattic/i18n-utils';
import { addPlanToCart, getNewSiteParams, processItemCart } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { getLocaleSlug } from 'i18n-calypso';
import wpcomRequest from 'wpcom-proxy-request';
import { useSelector } from 'calypso/state';
import { getCurrentUserName, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useFlowState } from '../declarative-flow/internals/state-manager/store';
import { getFlowFromURL } from '../utils/get-flow-from-url';
import type { DomainSuggestion, NewSiteSuccessResponse, Site } from '@automattic/data-stores';
import type { SiteGoal } from '@automattic/data-stores/src/onboard';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

type Params = {
	flowName: string;
	userIsLoggedIn: boolean;
	isPurchasingDomainItem: boolean;
	themeSlugWithRepo: string;
	siteVisibility: Site.Visibility;
	siteTitle: string;
	siteAccentColor: string;
	useThemeHeadstart: boolean;
	username: string;
	domainCartItems: MinimalRequestCartProduct[];
	partnerBundle?: string | null;
	domainItem?: DomainSuggestion;
	sourceSlug?: string;
	siteIntent?: string;
	siteGoals?: SiteGoal[];
	planCartItems?: MinimalRequestCartProduct[] | null;
};

async function fillCart(
	siteSlug: string,
	flowName: string,
	userIsLoggedIn: boolean,
	themeSlugWithRepo: string,
	domainCartItems: MinimalRequestCartProduct[] | null | undefined,
	planCartItems: MinimalRequestCartProduct[] | null | undefined
) {
	if ( siteSlug && planCartItems?.length ) {
		for ( const planCartItem of planCartItems ) {
			await addPlanToCart( siteSlug, flowName, true, themeSlugWithRepo, planCartItem );
		}
	}

	const isFreeThemePreselected = themeSlugWithRepo.startsWith( 'pub' );

	if ( domainCartItems?.length ) {
		for ( const domainCartItem of domainCartItems ) {
			await processItemCart(
				siteSlug,
				isFreeThemePreselected,
				themeSlugWithRepo,
				flowName,
				userIsLoggedIn,
				domainCartItem
			);
		}
	}
}

export const createSite = async ( {
	flowName,
	userIsLoggedIn,
	isPurchasingDomainItem,
	themeSlugWithRepo,
	siteVisibility,
	siteTitle,
	siteAccentColor,
	useThemeHeadstart,
	username,
	domainCartItems,
	partnerBundle = null,
	domainItem,
	sourceSlug,
	siteIntent,
	planCartItems,
}: Params ) => {
	const newSiteParams = getNewSiteParams( {
		flowToCheck: flowName,
		isPurchasingDomainItem,
		themeSlugWithRepo,
		siteTitle,
		siteAccentColor,
		useThemeHeadstart,
		siteVisibility,
		username,
		sourceSlug,
		siteIntent,
		partnerBundle,
	} );

	const locale = getLocaleSlug();

	const siteCreationResponse: NewSiteSuccessResponse = await wpcomRequest( {
		path: '/sites/new',
		apiVersion: '1.1',
		method: 'POST',
		body: {
			...newSiteParams,
			locale,
			lang_id: getLanguage( locale as string )?.value,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			options: newSiteParams.options,
		},
	} );

	const parsedBlogURL = new URL( siteCreationResponse?.blog_details.url );
	const siteSlug = parsedBlogURL.hostname;
	const siteId = siteCreationResponse?.blog_details.blogid;
	const siteDetails = {
		siteId,
		siteSlug,
		domainItem,
		siteCreated: true,
		goToCheckout: Boolean( planCartItems?.length ),
	};

	await fillCart(
		siteSlug,
		flowName,
		userIsLoggedIn,
		themeSlugWithRepo,
		domainCartItems,
		planCartItems
	);

	return siteDetails;
};

export const useCreateSite = () => {
	const flowName = getFlowFromURL();
	const userIsLoggedIn = useSelector( isUserLoggedIn );
	const { get, set } = useFlowState();
	const domains = get( 'domains' );
	const username = useSelector( getCurrentUserName );
	const planCartItems = get( 'plans' )?.cartItems;
	const createdSite = get( 'site' );
	const siteTitle = get( 'newsletterSetup' )?.siteTitle as string;

	/**
	 * Support singular and multiple domain cart items.
	 */
	const mergedDomainCartItems = Array.isArray( domains?.domainCart )
		? domains?.domainCart.slice( 0 )
		: [];

	if ( domains?.domainItem ) {
		mergedDomainCartItems.push( domains?.domainItem );
	}

	return useMutation( {
		mutationFn: async ( {
			theme,
			siteIntent,
		}: {
			theme: string;
			siteIntent: string;
			siteGoals?: SiteGoal[];
		} ) => {
			if ( createdSite ) {
				// If the site already exists, we need to fill the cart with the domain and plan items.
				// Because the user may have changed their mind about the domain or plan.
				await fillCart(
					createdSite.siteSlug,
					flowName,
					userIsLoggedIn,
					theme,
					mergedDomainCartItems,
					planCartItems
				);
				return createdSite;
			}
			return createSite( {
				flowName,
				userIsLoggedIn,
				isPurchasingDomainItem: false,
				themeSlugWithRepo: theme,
				siteVisibility: 1,
				siteTitle,
				// We removed the color option during newsletter onboarding.
				// But backend still expects/needs a value, so supplying the default.
				// Ideally should remove this and update code downstream to handle this.
				siteAccentColor: '#113AF5',
				useThemeHeadstart: true,
				username,
				domainCartItems: mergedDomainCartItems,
				partnerBundle: null,
				domainItem: domains?.domainItem as DomainSuggestion | undefined,
				siteIntent,
				planCartItems,
			} );
		},
		onSuccess: ( data ) => {
			set( 'site', data );
			return data;
		},
		throwOnError: true,
	} ).mutateAsync;
};
