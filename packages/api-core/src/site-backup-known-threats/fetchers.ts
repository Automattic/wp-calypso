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

const NO_KNOWN_THREATS: BackupKnownThreats = {
	malware: 0,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged: 0,
	fixed: 0,
};

/**
 * The counts a `threats_not_acknowledged` refusal carries in `data.known_threats`. Without usable
 * counts it returns zeros, since the backup was refused all the same and the user must still be
 * asked to acknowledge it.
 */
export function getRefusedKnownThreats( value: unknown ): BackupKnownThreats {
	const flagged = ( value as Partial< BackupKnownThreats > | null )?.flagged;
	return typeof flagged === 'number' && flagged > 0
		? { ...NO_KNOWN_THREATS, ...( value as Partial< BackupKnownThreats > ) }
		: NO_KNOWN_THREATS;
}

export function getContainingBackupPeriod(
	pages: BackupsKnownThreatsPage[] | BackupsKnownThreatsPage,
	rewindId: string | number
): number | null {
	const period = getBackupPeriod( rewindId );
	if ( ! Number.isFinite( period ) || period <= 0 ) {
		return null;
	}

	let containingPeriod: number | null = null;

	for ( const page of Array.isArray( pages ) ? pages : [ pages ] ) {
		for ( const candidate of page.periods ) {
			if ( candidate <= period && ( containingPeriod === null || candidate > containingPeriod ) ) {
				containingPeriod = candidate;
			}
		}
	}

	return containingPeriod;
}

export function getKnownThreatsForRewindId(
	pages: BackupsKnownThreatsPage[] | BackupsKnownThreatsPage,
	rewindId: string | number
): BackupKnownThreats | null {
	const containingPeriod = getContainingBackupPeriod( pages, rewindId );
	if ( containingPeriod === null ) {
		return null;
	}

	for ( const page of Array.isArray( pages ) ? pages : [ pages ] ) {
		if ( page.periods.includes( containingPeriod ) ) {
			return page.byPeriod[ containingPeriod ] ?? null;
		}
	}

	return null;
}

export async function fetchSiteBackupsKnownThreatsPage(
	siteId: number,
	page: number
): Promise< BackupsKnownThreatsPage > {
	// `known_threats_only` asks for just the fields read here (no per-backup stats), which keeps
	// the response small; servers that don't know it yet ignore it.
	const response: BackupsKnownThreatsResponse = await wpcom.req.get(
		{ path: `/sites/${ siteId }/rewind/backups`, apiNamespace: 'wpcom/v3' },
		{ number: 100, page, known_threats_only: true }
	);

	const byPeriod: Record< number, BackupKnownThreats > = {};
	const periods: number[] = [];
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
		periods.push( period );
		if ( oldestPeriod === null || period < oldestPeriod ) {
			oldestPeriod = period;
		}
		if ( backup.object?.known_threats ) {
			byPeriod[ period ] = backup.object.known_threats;
		}
	}

	return {
		byPeriod,
		periods,
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
