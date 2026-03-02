import config from '@automattic/calypso-config';
import { getLanguage } from '@automattic/i18n-utils';
import { addProductsToCart, getNewSiteParams, setThemeOnSite } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { getLocaleSlug } from 'i18n-calypso';
import wpcomRequest from 'wpcom-proxy-request';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { useFlowState } from '../declarative-flow/internals/state-manager/store';
import { getFlowFromURL } from '../utils/get-flow-from-url';
import type { DomainSuggestion } from '@automattic/api-core';
import type { NewSiteSuccessResponse, Site } from '@automattic/data-stores';
import type { SiteGoal } from '@automattic/data-stores/src/onboard';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

type Params = {
	flowName: string;
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

export const createSite = async ( {
	flowName,
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

	const cartItems = [
		...( planCartItems && planCartItems.length > 0 ? planCartItems : [] ),
		...domainCartItems,
	];

	if ( cartItems.length > 0 ) {
		await addProductsToCart( siteSlug, flowName, cartItems );
	}

	return siteDetails;
};

export const useCreateSite = () => {
	const flowName = getFlowFromURL();
	const { get, set } = useFlowState();
	const domains = get( 'domains' );
	const username = useSelector( getCurrentUserName );
	const planCartItems = get( 'plans' )?.cartItems;
	const createdSite = get( 'site' );
	const siteTitle = get( 'newsletterSetup' )?.siteTitle as string;

	/**
	 * Support singular and multiple domain cart items.
	 */
	const mergedDomainCartItems =
		domains && 'domainCart' in domains && Array.isArray( domains.domainCart )
			? domains.domainCart.slice( 0 )
			: [];

	if ( domains?.domainItem ) {
		mergedDomainCartItems.push( domains.domainItem );
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
				if ( theme ) {
					await setThemeOnSite( createdSite.siteSlug, theme );
				}

				const cartItems = [
					...( planCartItems && planCartItems.length > 0 ? planCartItems : [] ),
					...mergedDomainCartItems,
				];

				// If the site already exists, we need to fill the cart with the domain and plan items.
				// Because the user may have changed their mind about the domain or plan.
				if ( cartItems.length > 0 ) {
					await addProductsToCart( createdSite.siteSlug, flowName, cartItems );
				}
				return createdSite;
			}
			return createSite( {
				flowName,
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
