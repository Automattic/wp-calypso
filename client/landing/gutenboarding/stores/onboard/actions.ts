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

type State = import('.').State;
type FontPair = import('../../constants').FontPair;
type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type Template = VerticalsTemplates.Template;
type CreateSiteParams = import('@automattic/data-stores').Site.CreateSiteParams;

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

export const setFonts = ( fonts: FontPair | undefined ) => ( {
	type: 'SET_FONTS' as const,
	fonts,
} );

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
			site_information: {
				title: siteTitle,
			},
			site_creation_flow: 'gutenboarding',
			theme: `pub/${ selectedDesign?.slug || 'twentytwenty' }`,
			timezone_string: guessTimezone(),
			template: selectedDesign?.slug || 'twentytwenty',
			...( selectedFonts && {
				font_base: selectedFonts.base.fontFamily,
				font_headings: selectedFonts.headings.fontFamily,
			} ),
		},
		...( bearerToken && { authToken: bearerToken } ),
	};

	const success = yield dispatch( SITE_STORE, 'createSite', params );

	return success;
}

export type OnboardAction = ReturnType<
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
