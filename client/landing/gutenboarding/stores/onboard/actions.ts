/**
 * External dependencies
 */
import type { DomainSuggestions, Site, VerticalsTemplates, Plans } from '@automattic/data-stores';
import { dispatch, select } from '@wordpress/data-controls';
import guessTimezone from '../../../../lib/i18n-utils/guess-timezone';
import { getLanguage } from 'lib/i18n-utils';

/**
 * Internal dependencies
 */
import type { Design, SiteVertical } from './types';
import { STORE_KEY as ONBOARD_STORE } from './constants';
import { SITE_STORE } from '../site';
import { PLANS_STORE } from '../plans';
import type { State } from '.';
import type { FontPair } from '../../constants';
import type { FeatureId } from '../../onboarding-block/features/data';
import { isEnabled } from 'config';

type CreateSiteParams = Site.CreateSiteParams;
type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type Template = VerticalsTemplates.Template;
type Language = {
	value: number;
};

export const setDomain = ( domain: DomainSuggestion | undefined ) => ( {
	type: 'SET_DOMAIN' as const,
	domain,
} );

export const setDomainSearch = ( domainSearch: string ) => ( {
	type: 'SET_DOMAIN_SEARCH_TERM' as const,
	domainSearch,
} );

export const setDomainCategory = ( domainCategory: string | undefined ) => ( {
	type: 'SET_DOMAIN_CATEGORY' as const,
	domainCategory,
} );

export const setSelectedDesign = ( selectedDesign: Design | undefined ) => ( {
	type: 'SET_SELECTED_DESIGN' as const,
	selectedDesign,
} );

export const setSiteVertical = ( siteVertical: SiteVertical ) => ( {
	type: 'SET_SITE_VERTICAL' as const,
	siteVertical,
} );

export const skipSiteVertical = () => ( {
	type: 'SKIP_SITE_VERTICAL' as const,
} );

export const resetSiteVertical = () => ( {
	type: 'RESET_SITE_VERTICAL' as const,
} );

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: 'SET_SITE_TITLE' as const,
	siteTitle,
} );

export const togglePageLayout = ( pageLayout: Template ) => ( {
	type: 'TOGGLE_PAGE_LAYOUT' as const,
	pageLayout,
} );

export const resetFonts = () => ( {
	type: 'RESET_FONTS' as const,
} );

export const setFonts = ( fonts: FontPair | undefined ) => {
	return {
		type: 'SET_FONTS' as const,
		fonts: fonts,
	};
};

export const resetOnboardStore = () => ( {
	type: 'RESET_ONBOARD_STORE' as const,
} );

export const setSelectedSite = ( selectedSite: number | undefined ) => ( {
	type: 'SET_SELECTED_SITE' as const,
	selectedSite,
} );

export const setIsRedirecting = ( isRedirecting: boolean ) => ( {
	type: 'SET_IS_REDIRECTING' as const,
	isRedirecting,
} );

export const setHasUsedDomainsStep = ( hasUsedDomainsStep: boolean ) => ( {
	type: 'SET_HAS_USED_DOMAINS_STEP' as const,
	hasUsedDomainsStep,
} );

export const setHasUsedPlansStep = ( hasUsedPlansStep: boolean ) => ( {
	type: 'SET_HAS_USED_PLANS_STEP' as const,
	hasUsedPlansStep,
} );

export const setShowSignupDialog = ( showSignup: boolean ) => ( {
	type: 'SET_SHOW_SIGNUP_DIALOG' as const,
	showSignup,
} );

export const setPlan = ( plan: Plans.Plan ) => ( {
	type: 'SET_PLAN' as const,
	plan,
} );

export function* updatePlan( planSlug: Plans.PlanSlug ) {
	const plan: Plans.Plan = yield select( PLANS_STORE, 'getPlanBySlug', planSlug );
	yield setPlan( plan );
}

export function* createSite(
	username: string,
	languageSlug: string,
	bearerToken?: string,
	isPublicSite = false
) {
	const { domain, selectedDesign, selectedFonts, siteTitle, siteVertical }: State = yield select(
		ONBOARD_STORE,
		'getState'
	);

	const shouldEnableFse = !! selectedDesign?.is_fse;

	const siteUrl = domain?.domain_name || siteTitle || username;
	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;

	const defaultTheme = shouldEnableFse ? 'seedlet-blocks' : 'twentytwenty';

	const params: CreateSiteParams = {
		blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
		blog_title: siteTitle,
		public: isPublicSite ? 1 : -1,
		options: {
			site_vertical: siteVertical?.id,
			site_vertical_name: siteVertical?.label,
			// untranslated vertical slug
			// so we can match directories in
			// https://github.com/Automattic/wp-calypso/tree/HEAD/static/page-templates/verticals
			// TODO: determine default vertical should user input match no official vertical
			site_vertical_slug: siteVertical?.slug || 'football',
			site_information: {
				title: siteTitle,
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
			use_patterns: isEnabled( 'gutenboarding/use-patterns' ),
		},
		...( bearerToken && { authToken: bearerToken } ),
	};
	const success = yield dispatch( SITE_STORE, 'createSite', params );

	return success;
}

export const addFeature = ( featureId: FeatureId ) => ( {
	type: 'ADD_FEATURE' as const,
	featureId,
} );

export const removeFeature = ( featureId: FeatureId ) => ( {
	type: 'REMOVE_FEATURE' as const,
	featureId,
} );

export const enableExperimental = () => ( {
	type: 'SET_ENABLE_EXPERIMENTAL' as const,
} );

export type OnboardAction = ReturnType<
	| typeof resetFonts
	| typeof resetOnboardStore
	| typeof resetSiteVertical
	| typeof setDomain
	| typeof setDomainSearch
	| typeof setDomainCategory
	| typeof skipSiteVertical
	| typeof setFonts
	| typeof setIsRedirecting
	| typeof setHasUsedDomainsStep
	| typeof setHasUsedPlansStep
	| typeof setSelectedDesign
	| typeof setSelectedSite
	| typeof setSiteTitle
	| typeof setSiteVertical
	| typeof togglePageLayout
	| typeof setShowSignupDialog
	| typeof setPlan
	| typeof addFeature
	| typeof removeFeature
	| typeof enableExperimental
>;
