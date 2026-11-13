import {
	fetchSiteBackupsKnownThreatsPage,
	fetchSiteBackupThreats,
	getBackupPeriod,
	getContainingBackupPeriod,
	getKnownThreatsForRewindId,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { BackupKnownThreats, BackupsKnownThreatsPage } from '@automattic/api-core';

const MAX_KNOWN_THREATS_PAGES = 30;

// Per-backup endpoint answers after which paging through the list can still find the backup.
const PAGE_THROUGH_ERRORS = [ 'scan_required', 'unknown_backup' ];

export const siteBackupsKnownThreatsPageQuery = ( siteId: number, page: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backups', 'known-threats', 'page', page ],
		queryFn: () => fetchSiteBackupsKnownThreatsPage( siteId, page ),
		staleTime: 60_000,
		retry: false,
	} );

export const siteBackupsKnownThreatsQuery = ( siteId: number ) =>
	siteBackupsKnownThreatsPageQuery( siteId, 1 );

export const siteBackupThreatsQuery = ( siteId: number, backupPeriod: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'backup', backupPeriod, 'threats' ],
		queryFn: () => fetchSiteBackupThreats( siteId, String( backupPeriod ) ),
		staleTime: 60_000,
		retry: false,
	} );

type BackupKnownThreatsResult = {
	knownThreats: BackupKnownThreats | null;
	latestWithoutKnownThreats: number | null;
	backupPeriod: number | null;
};

const coversPeriod = ( page: BackupsKnownThreatsPage, period: number ) =>
	( page.oldestPeriod !== null && page.oldestPeriod <= period ) || page.totalPages <= 1;

const fromPages = ( pages: BackupsKnownThreatsPage[], period: number ) => ( {
	knownThreats: getKnownThreatsForRewindId( pages, period ),
	latestWithoutKnownThreats: pages[ 0 ]?.latestWithoutKnownThreats ?? null,
	backupPeriod: getContainingBackupPeriod( pages, period ),
} );

export const siteBackupKnownThreatsQuery = ( siteId: number, rewindId: string ) => {
	const period = getBackupPeriod( rewindId );
	return queryOptions( {
		queryKey: [ 'site', siteId, 'backup', period, 'known-threats' ],
		queryFn: async ( { client } ): Promise< BackupKnownThreatsResult > => {
			if ( ! Number.isFinite( period ) || period <= 0 ) {
				return { knownThreats: null, latestWithoutKnownThreats: null, backupPeriod: null };
			}

			// Page 1 holds the latest backup without known threats and, usually, the backup asked
			// about. For an older backup, ask the per-backup endpoint rather than page through: it
			// needs a backup period (not an Activity Log rewind id) and Scan, so page otherwise.
			const firstPage = await client.fetchQuery( siteBackupsKnownThreatsPageQuery( siteId, 1 ) );
			// No backup on page 1 carries known_threats when VaultPress doesn't send them yet (or couldn't
			// count them), so neither the per-backup endpoint nor later pages would have a verdict.
			if ( coversPeriod( firstPage, period ) || ! Object.keys( firstPage.byPeriod ).length ) {
				return fromPages( [ firstPage ], period );
			}

			try {
				const threats = await client.fetchQuery( siteBackupThreatsQuery( siteId, period ) );
				return {
					// Without a cutoff (the backup's finish time) there is no verdict.
					knownThreats: threats.cutoff ? threats.summary : null,
					latestWithoutKnownThreats: firstPage.latestWithoutKnownThreats,
					backupPeriod: threats.backup_id,
				};
			} catch ( error ) {
				// Not a backup period, or no Scan: page through instead. Any other failure, such as a
				// server without the endpoint yet, would make paging just as unreliable and much costlier.
				const { error: code, code: altCode } = ( error ?? {} ) as { error?: string; code?: string };
				if ( ! PAGE_THROUGH_ERRORS.includes( code ?? altCode ?? '' ) ) {
					return fromPages( [ firstPage ], period );
				}
			}

			const pages: BackupsKnownThreatsPage[] = [ firstPage ];
			for ( let page = 2; page <= MAX_KNOWN_THREATS_PAGES; page++ ) {
				const result = await client.fetchQuery( siteBackupsKnownThreatsPageQuery( siteId, page ) );
				pages.push( result );
				if (
					( result.oldestPeriod !== null && result.oldestPeriod <= period ) ||
					page >= result.totalPages
				) {
					break;
				}
			}

			return fromPages( pages, period );
		},
		staleTime: 60_000,
		retry: false,
	} );
};
