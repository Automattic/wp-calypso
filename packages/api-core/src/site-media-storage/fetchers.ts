import { wpcom } from '../wpcom-fetcher';
import type { SiteMediaStorage } from './types';

export async function fetchSiteMediaStorage( siteId: number ): Promise< SiteMediaStorage > {
	const mediaStorage = await wpcom.req.get( `/sites/${ siteId }/media-storage` );
	return {
		max_storage_bytes_from_add_ons: Number( mediaStorage.max_storage_bytes_from_add_ons ),
		max_storage_bytes: Number( mediaStorage.max_storage_bytes ),
		storage_used_bytes: Number( mediaStorage.storage_used_bytes ),
	};
}
