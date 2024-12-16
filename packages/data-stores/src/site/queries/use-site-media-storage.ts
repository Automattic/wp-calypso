import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { SiteMediaStorage, RawSiteMediaStorage } from '../types';

interface Props {
	siteIdOrSlug: string | number | null | undefined;
}

/**
 * Site media storage from `/sites/[ siteIdOrSlug ]/media-storage` endpoint
 * transposed to camelCase format
 */
function useSiteMediaStorage( {
	siteIdOrSlug,
}: Props ): UseQueryResult< SiteMediaStorage | undefined > {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.siteMediaStorage( siteIdOrSlug ),
		queryFn: async (): Promise< SiteMediaStorage | undefined > => {
			const mediaStorage = await wpcomRequest< RawSiteMediaStorage >( {
				path: `/sites/${ encodeURIComponent( siteIdOrSlug as string ) }/media-storage`,
				apiVersion: '1.1',
			} );

			return {
				maxStorageBytesFromAddOns: Number( mediaStorage.max_storage_bytes_from_add_ons ),
				maxStorageBytes: Number( mediaStorage.max_storage_bytes ),
				storageUsedBytes: Number( mediaStorage.storage_used_bytes ),
			};
		},
		enabled: !! siteIdOrSlug,
	} );
}

export default useSiteMediaStorage;
