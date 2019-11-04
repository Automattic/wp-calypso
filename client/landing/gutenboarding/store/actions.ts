/**
 * Internal dependencies
 */
import { ActionType, SiteType, Vertical, UNKNOWN_FORM_VALUE } from './types';

export const resetSiteType = () => ( {
	type: ActionType.SET_SITE_TYPE as const,
	siteType: UNKNOWN_FORM_VALUE,
} );

export const setSiteType = ( siteType: SiteType ) => ( {
	type: ActionType.SET_SITE_TYPE as const,
	siteType,
} );

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: ActionType.SET_SITE_TITLE as const,
	siteTitle,
} );

export const receiveVertical = ( search: string, verticals: Vertical[] ) => ( {
	type: ActionType.RECEIVE_VERTICAL as const,
	search,
	verticals,
} );
