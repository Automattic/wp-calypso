/**
 * Internal dependencies
 */
import { ActionType, SiteVertical } from './types';
import { DomainSuggestion } from '@automattic/calypso-data-stores/domain-suggestions/types';

export const setDomain = ( domain: DomainSuggestion ) => ( {
	type: ActionType.SET_DOMAIN as const,
	domain,
} );

export const setSiteVertical = ( siteVertical: SiteVertical ) => ( {
	type: ActionType.SET_SITE_VERTICAL as const,
	siteVertical,
} );

export const resetSiteVertical = () => ( {
	type: ActionType.RESET_SITE_VERTICAL as const,
} );

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: ActionType.SET_SITE_TITLE as const,
	siteTitle,
} );
