import {
	fetchSiteBackupsKnownThreatsPage,
	fetchSiteBackupThreats,
	getBackupPeriod,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { BackupKnownThreats } from '@automattic/api-core';

const MAX_KNOWN_THREATS_PAGES = 30;

export const siteBackupsKnownThreatsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups', 'known-threats' ],
		queryFn: () => fetchSiteBackupsKnownThreatsPage( siteId, 1 ),
		staleTime: 60_000,
		retry: false,
	} );

export const siteBackupKnownThreatsQuery = ( siteId: number, rewindId: string ) => {
	const period = getBackupPeriod( rewindId );
	return queryOptions( {
		queryKey: [ 'site', siteId, 'backup', period, 'known-threats' ],
		queryFn: async (): Promise< {
			knownThreats: BackupKnownThreats | null;
			latestWithoutKnownThreats: number | null;
		} > => {
			let latestWithoutKnownThreats: number | null = null;
			let knownThreats: BackupKnownThreats | null = null;

			for ( let page = 1; page <= MAX_KNOWN_THREATS_PAGES; page++ ) {
				const result = await fetchSiteBackupsKnownThreatsPage( siteId, page );
				if ( page === 1 ) {
					latestWithoutKnownThreats = result.latestWithoutKnownThreats;
				}
				if ( result.byPeriod[ period ] ) {
					knownThreats = result.byPeriod[ period ];
					break;
				}
				if (
					( result.oldestPeriod !== null && result.oldestPeriod < period ) ||
					page >= result.totalPages
				) {
					break;
				}
			}

			return { knownThreats, latestWithoutKnownThreats };
		},
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
