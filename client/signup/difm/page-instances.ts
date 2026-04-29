/**
 * DIFM page instances: unique id per selected page (Option A).
 * Single-only types: Home, Contact, Blog, Newsletter.
 * All others can be added multiple times via − / +.
 * Custom page(s) last in order.
 */

import {
	HOME_PAGE,
	CONTACT_PAGE,
	BLOG_PAGE,
	NEWSLETTER_PAGE,
	ABOUT_PAGE,
	SERVICES_PAGE,
	EVENTS_PAGE,
	TESTIMONIALS_PAGE,
	PHOTO_GALLERY_PAGE,
	VIDEO_GALLERY_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	PRICING_PAGE,
	TEAM_PAGE,
	CAREERS_PAGE,
	DONATE_PAGE,
	CASE_STUDIES_PAGE,
	CUSTOM_PAGE,
	SHOP_PAGE,
} from './constants';
import type { PageId } from './constants';

export interface PageInstance {
	id: string;
	type: PageId;
	title?: string;
}

/** Page types that can only appear once (no − / +). */
export const SINGLE_ONLY_PAGE_TYPES: PageId[] = [
	HOME_PAGE,
	CONTACT_PAGE,
	BLOG_PAGE,
	NEWSLETTER_PAGE,
];

/** Display order for page types. Custom last. Store flow inserts SHOP_PAGE after HOME. */
export const PAGE_TYPE_ORDER: PageId[] = [
	HOME_PAGE,
	ABOUT_PAGE,
	CONTACT_PAGE,
	BLOG_PAGE,
	PHOTO_GALLERY_PAGE,
	VIDEO_GALLERY_PAGE,
	SERVICES_PAGE,
	PRICING_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	TESTIMONIALS_PAGE,
	TEAM_PAGE,
	CAREERS_PAGE,
	EVENTS_PAGE,
	DONATE_PAGE,
	NEWSLETTER_PAGE,
	CASE_STUDIES_PAGE,
	CUSTOM_PAGE,
];

export function isSingleOnly( type: PageId ): boolean {
	return SINGLE_ONLY_PAGE_TYPES.includes( type );
}

export function isMultiAdd( type: PageId ): boolean {
	return ! isSingleOnly( type ) && type !== SHOP_PAGE; // Shop is store-only, one
}

/** Generate next instance id for a type (e.g. SERVICES_PAGE -> SERVICES_PAGE_2). */
export function nextInstanceId( type: PageId, existingInstances: PageInstance[] ): string {
	const sameType = existingInstances.filter( ( p ) => p.type === type );
	if ( sameType.length === 0 ) {
		return type;
	}
	return `${ type }_${ sameType.length + 1 }`;
}

/** Build instances for a type given count. For CUSTOM_PAGE, titles can be provided. */
export function buildInstancesForType(
	type: PageId,
	count: number,
	existingInstances: PageInstance[],
	customTitles?: string[]
): PageInstance[] {
	if ( count <= 0 ) {
		return [];
	}
	const existingOfType = existingInstances.filter( ( p ) => p.type === type ).length;
	const instances: PageInstance[] = [];
	for ( let i = 0; i < count; i++ ) {
		const n = existingOfType + i + 1;
		const id = n === 1 ? type : `${ type }_${ n }`;
		const title = type === CUSTOM_PAGE && customTitles?.[ i ] ? customTitles[ i ] : undefined;
		instances.push( { id, type, ...( title && { title } ) } );
	}
	return instances;
}

export function countInstancesOfType( instances: PageInstance[], type: PageId ): number {
	return instances.filter( ( p ) => p.type === type ).length;
}

/** Get display order for picker: SHOP_PAGE after HOME when store flow. */
export function getPageTypeOrderForPicker( isStoreFlow: boolean ): PageId[] {
	if ( ! isStoreFlow ) {
		return PAGE_TYPE_ORDER.filter( ( t ) => t !== SHOP_PAGE );
	}
	const withoutShop = PAGE_TYPE_ORDER.filter( ( t ) => t !== SHOP_PAGE );
	const homeIndex = withoutShop.indexOf( HOME_PAGE );
	const before = withoutShop.slice( 0, homeIndex + 1 );
	const after = withoutShop.slice( homeIndex + 1 );
	return [ ...before, SHOP_PAGE, ...after ];
}

/**
 * Build SelectedPageInstance[] from a list of page types (e.g. from API selected_page_titles).
 * First occurrence of a type gets id = type, second gets type_2, etc.
 */
export function synthesizeInstancesFromTitles( titles: PageId[] ): PageInstance[] {
	const countByType: Partial< Record< PageId, number > > = {};
	return titles.map( ( type ) => {
		const n = ( countByType[ type ] ?? 0 ) + 1;
		countByType[ type ] = n;
		const id = n === 1 ? type : `${ type }_${ n }`;
		return { id, type };
	} );
}
