/**
 * DIFM page instances: unique id per selected page (Option A).
 * First instance of a type uses the bare type as id; repeats are suffixed (e.g. CUSTOM_PAGE_2).
 */

import type { PageId } from './constants';

export interface PageInstance {
	id: string;
	type: PageId;
	title?: string;
}

/** Generate next instance id for a type (e.g. SERVICES_PAGE -> SERVICES_PAGE_2). */
export function nextInstanceId( type: PageId, existingInstances: PageInstance[] ): string {
	const sameType = existingInstances.filter( ( p ) => p.type === type );
	if ( sameType.length === 0 ) {
		return type;
	}
	return `${ type }_${ sameType.length + 1 }`;
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

const PAGE_DATA_ID_SUFFIX = /^(.+)_(\d+)$/;

/**
 * Map an accordion/page row `id` (instance key like SERVICES_PAGE_2 or a bare PageId) to its PageId type.
 */
export function getPageTypeFromPageDataId( pageDataId: PageId | string ): PageId {
	const m = PAGE_DATA_ID_SUFFIX.exec( pageDataId );
	if ( m ) {
		return m[ 1 ] as PageId;
	}
	return pageDataId as PageId;
}
