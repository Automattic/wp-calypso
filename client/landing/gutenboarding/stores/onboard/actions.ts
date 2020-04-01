/**
 * External dependencies
 */
import { DomainSuggestions, VerticalsTemplates } from '@automattic/data-stores';
import { dispatch, select } from '@wordpress/data-controls';
import guessTimezone from '../../../../lib/i18n-utils/guess-timezone';

/**
 * Internal dependencies
 */
import { Design, SiteVertical } from './types';
import { STORE_KEY as ONBOARD_STORE } from './constants';
import { SITE_STORE } from '../site';

type CreateSiteParams = import('@automattic/data-stores').Site.CreateSiteParams;
type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type Font = import('../../constants').Font;
type FontPair = import('../../constants').FontPair;
type State = import('.').State;
type Template = VerticalsTemplates.Template;

export const setDomain = ( domain: DomainSuggestion | undefined ) => ( {
	type: 'SET_DOMAIN' as const,
	domain,
} );

export const setSelectedDesign = ( selectedDesign: Design | undefined ) => ( {
	type: 'SET_SELECTED_DESIGN' as const,
	selectedDesign,
} );

export const setSiteVertical = ( siteVertical: SiteVertical ) => ( {
	type: 'SET_SITE_VERTICAL' as const,
	siteVertical,
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

// Handles { headings, base } and [ headings, base ] formats
export const setFonts = ( fonts: FontPair | [ Font, Font ] | undefined ) => {
	const nextFonts: FontPair | undefined = Array.isArray( fonts )
		? { headings: fonts[ 0 ], base: fonts[ 1 ] }
		: fonts;
	return {
		type: 'SET_FONTS' as const,
		fonts: nextFonts,
	};
};

export const resetOnboardStore = () => ( {
	type: 'RESET_ONBOARD_STORE' as const,
} );

export const setSiteWasCreatedForDomainPurchase = (
	siteWasCreatedForDomainPurchase: boolean
) => ( {
	type: 'SET_SITE_WAS_CREATED_FOR_DOMAIN_PURCHASE' as const,
	siteWasCreatedForDomainPurchase,
} );

export function* createSite(
	username: string,
	freeDomainSuggestion?: DomainSuggestion,
	bearerToken?: string
) {
	const { domain, selectedDesign, selectedFonts, siteTitle, siteVertical }: State = yield select(
		ONBOARD_STORE,
		'getState'
	);

	const currentDomain = domain ?? freeDomainSuggestion;
	const siteUrl = currentDomain?.domain_name || siteTitle || username;

	const params: CreateSiteParams = {
		blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
		blog_title: siteTitle,
		options: {
			site_vertical: siteVertical?.id,
			site_vertical_name: siteVertical?.label,
			// untranslated vertical slug
			// so we can match directories in
			// https://github.com/Automattic/wp-calypso/tree/master/static/page-templates/verticals
			// TODO: determine default vertical should user input match no official vertical
			site_vertical_slug: siteVertical?.slug || 'football',
			site_information: {
				title: siteTitle,
			},
			site_creation_flow: 'gutenboarding',
			theme: `pub/${ selectedDesign?.theme || 'twentytwenty' }`,
			timezone_string: guessTimezone(),
			template: selectedDesign?.template || 'twentytwenty',
			...( selectedFonts && {
				font_base: selectedFonts.base,
				font_headings: selectedFonts.headings,
			} ),
		},
		...( bearerToken && { authToken: bearerToken } ),
	};

	const success = yield dispatch( SITE_STORE, 'createSite', params );

	return success;
}

export type OnboardAction = ReturnType<
	| typeof resetFonts
	| typeof resetOnboardStore
	| typeof resetSiteVertical
	| typeof setDomain
	| typeof setFonts
	| typeof setSelectedDesign
	| typeof setSiteTitle
	| typeof setSiteVertical
	| typeof setSiteWasCreatedForDomainPurchase
	| typeof togglePageLayout
>;
