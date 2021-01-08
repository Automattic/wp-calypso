/**
 * External dependencies
 */
import {
	DomainSuggestions,
	Site,
	VerticalsTemplates,
	Plans,
	WPCOMFeatures,
} from '@automattic/data-stores';
import { dispatch, select } from '@wordpress/data-controls';
import guessTimezone from '../../../../lib/i18n-utils/guess-timezone';
import { getLanguage } from 'calypso/lib/i18n-utils';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { Design, SiteVertical } from './types';
import { STORE_KEY as ONBOARD_STORE } from './constants';
import { SITE_STORE } from '../site';
import { PLANS_STORE } from '../plans';
import type { State } from '.';
import type { FontPair } from '../../constants';

type CreateSiteParams = Site.CreateSiteParams;
type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type Template = VerticalsTemplates.Template;
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
	anchorFmSpotifyShowUrl: string | null;
}

export function* createSite( {
	username,
	languageSlug,
	bearerToken = undefined,
	visibility = Site.Visibility.PublicNotIndexed,
	anchorFmPodcastId = null,
	anchorFmEpisodeId = null,
	anchorFmSpotifyShowUrl = null,
}: CreateSiteActionParameters ) {
	const {
		domain,
		selectedDesign,
		selectedFonts,
		siteTitle,
		siteVertical,
		selectedFeatures,
	}: State = yield select( ONBOARD_STORE, 'getState' );

	const shouldEnableFse = !! selectedDesign?.is_fse;
	const siteUrl = domain?.domain_name || siteTitle || username;
	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;
	const defaultTheme = shouldEnableFse ? 'seedlet-blocks' : 'twentytwenty';
	const blogTitle = siteTitle.trim() === '' ? __( 'Site Title' ) : siteTitle;

	const params: CreateSiteParams = {
		blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
		blog_title: blogTitle,
		public: visibility,
		options: {
			site_vertical: siteVertical?.id,
			site_vertical_name: siteVertical?.label,
			// untranslated vertical slug
			// so we can match directories in
			// https://github.com/Automattic/wp-calypso/tree/HEAD/static/page-templates/verticals
			// TODO: determine default vertical should user input match no official vertical
			site_vertical_slug: siteVertical?.slug,
			site_information: {
				title: blogTitle,
			},
			lang_id: lang_id,
			site_creation_flow: 'gutenboarding',
			enable_fse: shouldEnableFse,
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
			...( anchorFmSpotifyShowUrl && {
				anchor_fm_spotify_show_url: anchorFmSpotifyShowUrl,
			} ),
		},
		...( bearerToken && { authToken: bearerToken } ),
	};
	const success = yield dispatch( SITE_STORE, 'createSite', params );

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

export const resetSiteVertical = () => ( {
	type: 'RESET_SITE_VERTICAL' as const,
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

export const setPlan = ( plan: Plans.Plan ) => ( {
	type: 'SET_PLAN' as const,
	plan,
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

export const setSiteVertical = ( siteVertical: SiteVertical ) => ( {
	type: 'SET_SITE_VERTICAL' as const,
	siteVertical,
} );

export const skipSiteVertical = () => ( {
	type: 'SKIP_SITE_VERTICAL' as const,
} );

export const togglePageLayout = ( pageLayout: Template ) => ( {
	type: 'TOGGLE_PAGE_LAYOUT' as const,
	pageLayout,
} );

export function* updatePlan( planSlug: Plans.PlanSlug ) {
	const plan: Plans.Plan = yield select( PLANS_STORE, 'getPlanBySlug', planSlug );
	yield setPlan( plan );
}

export const startOnboarding = () => ( {
	type: 'ONBOARDING_START' as const,
} );

export type OnboardAction = ReturnType<
	| typeof addFeature
	| typeof removeFeature
	| typeof resetFonts
	| typeof resetOnboardStore
	| typeof resetSiteVertical
	| typeof setDomain
	| typeof setDomainCategory
	| typeof setDomainSearch
	| typeof setFonts
	| typeof setHasUsedDomainsStep
	| typeof setHasUsedPlansStep
	| typeof setIsRedirecting
	| typeof setPlan
	| typeof setRandomizedDesigns
	| typeof setSelectedDesign
	| typeof setSelectedSite
	| typeof setShowSignupDialog
	| typeof setSiteTitle
	| typeof setSiteVertical
	| typeof skipSiteVertical
	| typeof togglePageLayout
	| typeof startOnboarding
>;
