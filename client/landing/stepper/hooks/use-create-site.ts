import config from '@automattic/calypso-config';
import { getLanguage } from '@automattic/i18n-utils';
import { getNewSiteParams, processItemCart } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { getLocaleSlug } from 'i18n-calypso';
import { useLocation } from 'react-router';
import wpcomRequest from 'wpcom-proxy-request';
import { getFlowFromURL } from '../utils/get-flow-from-url';
import type { DomainSuggestion, NewSiteSuccessResponse, Site } from '@automattic/data-stores';
import type { SiteGoal } from '@automattic/data-stores/src/onboard';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useFlowState } from '../declarative-flow/internals/state-manager/store';

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
	storedSiteUrl?: string;
	domainItem?: DomainSuggestion;
	sourceSlug?: string;
	siteIntent?: string;
	siteGoals?: SiteGoal[];
};

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
	storedSiteUrl,
	domainItem,
	sourceSlug,
	siteIntent,
	siteGoals = [],
}: Params ) => {
	const siteUrl = storedSiteUrl || domainItem?.domain_name;
	const isFreeThemePreselected = themeSlugWithRepo.startsWith( 'pub' );

	const newSiteParams = getNewSiteParams( {
		flowToCheck: flowName,
		isPurchasingDomainItem,
		themeSlugWithRepo,
		siteUrl,
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
	const hasSegmentationSurvey: boolean =
		newSiteParams[ 'options' ][ 'site_creation_flow' ] === 'entrepreneur';
	const segmentationSurveyAnswersAnonId = localStorage.getItem( 'ss-anon-id' );
	localStorage.removeItem( 'ss-anon-id' );

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
			options: {
				...newSiteParams.options,
				has_segmentation_survey: hasSegmentationSurvey,
				...( hasSegmentationSurvey && segmentationSurveyAnswersAnonId
					? { segmentation_survey_answers_anon_id: segmentationSurveyAnswersAnonId }
					: {} ),
				...( siteGoals && { site_goals: siteGoals } ),
			},
		},
	} );

	const parsedBlogURL = new URL( siteCreationResponse?.blog_details.url );
	const siteSlug = parsedBlogURL.hostname;
	const siteId = siteCreationResponse?.blog_details.blogid;
	const providedDependencies = {
		siteId,
		siteSlug,
		domainItem,
	};

	if ( domainCartItems.length ) {
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

	return providedDependencies;
};

export const useCreateSite = () => {
	const location = useLocation();
	const flowName = getFlowFromURL( location.pathname ) as string;
	const userIsLoggedIn = useSelector( isUserLoggedIn );
	const { get } = useFlowState();
	const domains = get( 'domains' );

	return useMutation( {
		mutationFn: () =>
			createSite( {
				flowName,
				userIsLoggedIn,
				isPurchasingDomainItem: false,
				themeSlugWithRepo: 'pub/wordpress-theme-2021',
				siteVisibility: 1,
				siteTitle: 'My New Site',
				siteAccentColor: '#007cba',
				useThemeHeadstart: true,
				username: 'username',
				domainCartItems: [],
				partnerBundle: null,
				storedSiteUrl: null,
				domainItem: null,
				sourceSlug: null,
				siteIntent: null,
				siteGoals: [],
			} ),
	} );
};
