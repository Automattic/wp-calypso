import { DUMMY_DATA_VIEW_PREFIX } from './constants';
import type { SiteExcerptData } from '@automattic/sites';

export function getSitesPagination(
	allSites: SiteExcerptData[],
	perPage: number
): {
	totalItems: number;
	totalPages: number;
} {
	const totalItems = allSites.length;
	const totalPages = Math.ceil( totalItems / perPage );

	return { totalItems, totalPages };
}

export function removeDummyDataViewPrefix( dataView: string ) {
	return dataView.replace( DUMMY_DATA_VIEW_PREFIX, '' );
}
