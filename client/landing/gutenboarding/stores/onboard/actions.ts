/**
 * External dependencies
 */
import { VerticalsTemplates } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { Design, SiteVertical } from './types';

type Template = VerticalsTemplates.Template;

export const setDomain = (
	domain: import('@automattic/data-stores').DomainSuggestions.DomainSuggestion | undefined
) => ( {
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

export const resetOnboardStore = () => ( {
	type: 'RESET_ONBOARD_STORE' as const,
} );

export type OnboardAction = ReturnType<
	| typeof setDomain
	| typeof setSelectedDesign
	| typeof setSiteVertical
	| typeof resetSiteVertical
	| typeof setSiteTitle
	| typeof togglePageLayout
	| typeof resetOnboardStore
>;
