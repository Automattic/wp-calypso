/**
 * Internal dependencies
 */
import { ActionType, SiteType } from './types';

export const setSiteType = ( siteType: SiteType ) => ( {
	type: ActionType.SET_SITE_TYPE,
	siteType,
} );

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: ActionType.SET_SITE_TITLE,
	siteTitle,
} );
