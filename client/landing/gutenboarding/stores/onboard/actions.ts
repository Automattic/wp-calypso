/**
 * Internal dependencies
 */
import { ActionType, SiteVertical, TemporaryAccount, TemporaryBlog } from './types';

export const setDomain = (
	domain: import('@automattic/data-stores').DomainSuggestions.DomainSuggestion
) => ( {
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

export const setTemporaryBlog = ( temporaryBlog: TemporaryBlog ) => ( {
    type: ActionType.SET_TEMPORARY_BLOG as const,
    temporaryBlog,
} );

export const setTemporaryAccount = ( temporaryAccount: TemporaryAccount ) => ( {
    type: ActionType.SET_TEMPORARY_ACCOUNT as const,
    temporaryAccount,
} );

