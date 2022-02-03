import { DomainSuggestions, Site, WPCOMFeatures } from '@automattic/data-stores';
import { isBlankCanvasDesign } from '@automattic/design-picker';
import { dispatch, select } from '@wordpress/data-controls';
import { __ } from '@wordpress/i18n';
import { getLanguage } from 'calypso/lib/i18n-utils';
import guessTimezone from '../../../../lib/i18n-utils/guess-timezone';
import { SITE_STORE } from '../site';
import { STORE_KEY as ONBOARD_STORE } from './constants';
import type { State } from '.';
import type { Design, FontPair } from '@automattic/design-picker';

type CreateSiteParams = Site.CreateSiteParams;
type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type Language = {
	value: number;
};
type FeatureId = WPCOMFeatures.FeatureId;

export const addFeature = ( featureId: FeatureId ) => ( {
	type: 'ADD_FEATURE' as const,
	featureId,
} );

export interface CreateSiteActionParameters {
	username: string;
	languageSlug: string;
	bearerToken?: string;
	visibility: number;
	anchorFmPodcastId: string | null;
	anchorFmEpisodeId: string | null;
	anchorFmSpotifyUrl: string | null;
}

export function* createSite( {
	username,
	languageSlug,
	bearerToken = undefined,
	visibility = Site.Visibility.PublicNotIndexed,
	anchorFmPodcastId = null,
	anchorFmEpisodeId = null,
	anchorFmSpotifyUrl = null,
}: CreateSiteActionParameters ) {
	const {
		domain,
		selectedDesign,
		selectedFonts,
		siteTitle,
		selectedFeatures,
	}: State = yield select( ONBOARD_STORE, 'getState' );

	const siteUrl = domain?.domain_name || siteTitle || username;
	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;
	const defaultTheme = 'zoologist';
	const blogTitle = siteTitle.trim() === '' ? __( 'Site Title' ) : siteTitle;

	const params: CreateSiteParams = {
		blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
		blog_title: blogTitle,
		public: visibility,
		options: {
			site_information: {
				title: blogTitle,
			},
			lang_id: lang_id,
			site_creation_flow: 'gutenboarding',
			enable_fse: true,
			theme: `pub/${ selectedDesign?.theme || defaultTheme }`,
			timezone_string: guessTimezone(),
			...( selectedDesign?.template && { template: selectedDesign.template } ),
			...( selectedFonts && {
				font_base: selectedFonts.base,
				font_headings: selectedFonts.headings,
			} ),
			use_patterns: true,
			selected_features: selectedFeatures,
			wpcom_public_coming_soon: 1,
			...( anchorFmPodcastId && {
				anchor_fm_podcast_id: anchorFmPodcastId,
			} ),
			...( anchorFmEpisodeId && {
				anchor_fm_episode_id: anchorFmEpisodeId,
			} ),
			...( anchorFmSpotifyUrl && {
				anchor_fm_spotify_url: anchorFmSpotifyUrl,
			} ),
			...( selectedDesign && { is_blank_canvas: isBlankCanvasDesign( selectedDesign ) } ),
		},
		...( bearerToken && { authToken: bearerToken } ),
	};
	const success: Site.NewSiteBlogDetails | undefined = yield dispatch(
		SITE_STORE,
		'createSite',
		params
	);

	return success;
}

export const removeFeature = ( featureId: FeatureId ) => ( {
	type: 'REMOVE_FEATURE' as const,
	featureId,
} );

export const resetFonts = () => ( {
	type: 'RESET_FONTS' as const,
} );

export const resetOnboardStore = () => ( {
	type: 'RESET_ONBOARD_STORE' as const,
} );

export const setDomain = ( domain: DomainSuggestion | undefined ) => ( {
	type: 'SET_DOMAIN' as const,
	domain,
} );

export const setDomainCategory = ( domainCategory: string | undefined ) => ( {
	type: 'SET_DOMAIN_CATEGORY' as const,
	domainCategory,
} );

export const setDomainSearch = ( domainSearch: string ) => ( {
	type: 'SET_DOMAIN_SEARCH_TERM' as const,
	domainSearch,
} );

export const setFonts = ( fonts: FontPair | undefined ) => {
	return {
		type: 'SET_FONTS' as const,
		fonts: fonts,
	};
};

export const setHasUsedDomainsStep = ( hasUsedDomainsStep: boolean ) => ( {
	type: 'SET_HAS_USED_DOMAINS_STEP' as const,
	hasUsedDomainsStep,
} );

export const setHasUsedPlansStep = ( hasUsedPlansStep: boolean ) => ( {
	type: 'SET_HAS_USED_PLANS_STEP' as const,
	hasUsedPlansStep,
} );

export const setIsRedirecting = ( isRedirecting: boolean ) => ( {
	type: 'SET_IS_REDIRECTING' as const,
	isRedirecting,
} );

export const setLastLocation = ( path: string ) => ( {
	type: 'SET_LAST_LOCATION' as const,
	path,
} );

export const setPlanProductId = ( planProductId: number | undefined ) => ( {
	type: 'SET_PLAN_PRODUCT_ID' as const,
	planProductId,
} );

export const setRandomizedDesigns = ( randomizedDesigns: { featured: Design[] } ) => ( {
	type: 'SET_RANDOMIZED_DESIGNS' as const,
	randomizedDesigns,
} );

export const setSelectedDesign = ( selectedDesign: Design | undefined ) => ( {
	type: 'SET_SELECTED_DESIGN' as const,
	selectedDesign,
} );

export const setSelectedSite = ( selectedSite: number | undefined ) => ( {
	type: 'SET_SELECTED_SITE' as const,
	selectedSite,
} );

export const setShowSignupDialog = ( showSignup: boolean ) => ( {
	type: 'SET_SHOW_SIGNUP_DIALOG' as const,
	showSignup,
} );

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: 'SET_SITE_TITLE' as const,
	siteTitle,
} );

export function updatePlan( planProductId: number ) {
	// keep updatePlan for backwards compat
	return setPlanProductId( planProductId );
}

export const startOnboarding = () => ( {
	type: 'ONBOARDING_START' as const,
} );

export type OnboardAction = ReturnType<
	| typeof addFeature
	| typeof removeFeature
	| typeof resetFonts
	| typeof resetOnboardStore
	| typeof setDomain
	| typeof setDomainCategory
	| typeof setDomainSearch
	| typeof setFonts
	| typeof setHasUsedDomainsStep
	| typeof setHasUsedPlansStep
	| typeof setIsRedirecting
	| typeof setLastLocation
	| typeof setPlanProductId
	| typeof setRandomizedDesigns
	| typeof setSelectedDesign
	| typeof setSelectedSite
	| typeof setShowSignupDialog
	| typeof setSiteTitle
	| typeof startOnboarding
>;
