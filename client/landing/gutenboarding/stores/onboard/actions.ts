/**
 * External dependencies
 */
import { DomainSuggestions, VerticalsTemplates } from '@automattic/data-stores';
import { dispatch, select } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { Design, SiteVertical } from './types';
import { STORE_KEY as ONBOARD_STORE } from './constants';
import { SITE_STORE } from '../site';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;
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

export const resetOnboardStore = () => ( {
	type: 'RESET_ONBOARD_STORE' as const,
} );

export function* createSite(
	username: string,
	freeDomainSuggestion?: DomainSuggestion,
	bearerToken?: string
) {
	const { domain, selectedDesign, siteTitle, siteVertical } = yield select(
		ONBOARD_STORE,
		'getState'
	);

	const currentDomain = domain ?? freeDomainSuggestion;
	const siteUrl = currentDomain?.domain_name || siteTitle || username;

	const success = yield dispatch( SITE_STORE, 'createSite', {
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
		},
		...( bearerToken && { authToken: bearerToken } ),
	} );

	return success;
}

export type OnboardAction = ReturnType<
	| typeof setDomain
	| typeof setSelectedDesign
	| typeof setSiteVertical
	| typeof resetSiteVertical
	| typeof setSiteTitle
	| typeof togglePageLayout
	| typeof resetOnboardStore
>;
