import {
	fetchSiteBackupsKnownThreatsPage,
	fetchSiteBackupThreats,
	getBackupPeriod,
	getKnownThreatsForRewindId,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { BackupKnownThreats, BackupsKnownThreatsPage } from '@automattic/api-core';

const MAX_KNOWN_THREATS_PAGES = 30;

export const siteBackupsKnownThreatsPageQuery = ( siteId: number, page: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups', 'known-threats', 'page', page ],
		queryFn: () => fetchSiteBackupsKnownThreatsPage( siteId, page ),
		staleTime: 60_000,
		retry: false,
	} );

export const siteBackupsKnownThreatsQuery = ( siteId: number ) =>
	siteBackupsKnownThreatsPageQuery( siteId, 1 );

export const siteBackupKnownThreatsQuery = ( siteId: number, rewindId: string ) => {
	const period = getBackupPeriod( rewindId );
	return queryOptions( {
		queryKey: [ 'site', siteId, 'backup', period, 'known-threats' ],
		queryFn: async ( {
			client,
		} ): Promise< {
			knownThreats: BackupKnownThreats | null;
			latestWithoutKnownThreats: number | null;
		} > => {
			if ( ! Number.isFinite( period ) || period <= 0 ) {
				return { knownThreats: null, latestWithoutKnownThreats: null };
			}

			const pages: BackupsKnownThreatsPage[] = [];

			for ( let page = 1; page <= MAX_KNOWN_THREATS_PAGES; page++ ) {
				const result = await client.fetchQuery( siteBackupsKnownThreatsPageQuery( siteId, page ) );
				pages.push( result );
				if (
					( result.oldestPeriod !== null && result.oldestPeriod <= period ) ||
					page >= result.totalPages
				) {
					break;
				}
			}

			return {
				knownThreats: getKnownThreatsForRewindId( pages, period ),
				latestWithoutKnownThreats: pages[ 0 ]?.latestWithoutKnownThreats ?? null,
			};
		},
		staleTime: 60_000,
		retry: false,
	} );
};

export const siteBackupThreatsQuery = ( siteId: number, rewindId: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup', getBackupPeriod( rewindId ), 'threats' ],
		queryFn: () => fetchSiteBackupThreats( siteId, rewindId ),
		staleTime: 60_000,
		retry: false,
	} );
