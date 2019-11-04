/**
 * Internal dependencies
 */
import { ActionType, FormValue, SiteType, Vertical } from './types';

export const setSiteType = ( siteType: FormValue< SiteType > ) => ( {
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
