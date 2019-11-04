/**
 * Internal dependencies
 */
import { ActionType, SiteType, Vertical } from './types';

export const resetSiteType = () => ( {
	type: ActionType.RESET_SITE_TYPE as const,
} );

export const setSiteType = ( siteType: SiteType ) => ( {
	type: ActionType.SET_SITE_TYPE as const,
	siteType,
} );

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: ActionType.SET_SITE_TITLE as const,
	siteTitle,
} );

export const receiveVerticals = ( verticals: Vertical[] ) => ( {
	type: ActionType.RECEIVE_VERTICALS as const,
	verticals,
} );
