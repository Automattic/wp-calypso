import { wpcom } from '../wpcom-fetcher';
import type {
	BackupKnownThreats,
	BackupsKnownThreatsPage,
	BackupsKnownThreatsResponse,
	BackupThreats,
} from './types';

export const getBackupPeriod = ( rewindId: string | number ): number =>
	Math.floor( Number( rewindId ) );

export const isFlagged = ( knownThreats?: BackupKnownThreats | null ): boolean =>
	!! knownThreats && knownThreats.flagged > 0;

export async function fetchSiteBackupsKnownThreatsPage(
	siteId: number,
	page: number
): Promise< BackupsKnownThreatsPage > {
	const response: BackupsKnownThreatsResponse = await wpcom.req.get(
		{ path: `/sites/${ siteId }/rewind/backups`, apiNamespace: 'wpcom/v3' },
		{ number: 100, page }
	);

	const byPeriod: Record< number, BackupKnownThreats > = {};
	let oldestPeriod: number | null = null;

	for ( const backup of response.backups ?? [] ) {
		const rawPeriod = backup.object?.backup_period;
		if ( rawPeriod === undefined ) {
			continue;
		}
		const period = Number( rawPeriod );
		if ( Number.isNaN( period ) ) {
			continue;
		}
		if ( oldestPeriod === null || period < oldestPeriod ) {
			oldestPeriod = period;
		}
		if ( backup.object?.known_threats ) {
			byPeriod[ period ] = backup.object.known_threats;
		}
	}

	return {
		byPeriod,
		latestWithoutKnownThreats: response.latest_without_known_threats ?? null,
		oldestPeriod,
		totalPages: response.totalPages ?? 1,
	};
}

export function fetchSiteBackupThreats(
	siteId: number,
	rewindId: string
): Promise< BackupThreats > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/rewind/backups/${ rewindId }/threats`,
		apiNamespace: 'wpcom/v2',
	} );
}
