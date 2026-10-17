import { isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { backupRestorePath } from 'calypso/my-sites/backup/paths';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import type { ComponentType } from 'react';

interface RestoreTarget {
	siteId: number;
	rewindId?: string | null;
	enabled: boolean;
}

export interface KnownThreatsRestorePathProps {
	knownThreatsRestorePath: string | null;
}

/**
 * Returns the restore page path when a restore of `rewindId` must go through the
 * acknowledgement on that page: the backup has known threats, or its counts are not loaded yet.
 * Returns null when the backup can be restored directly.
 */
export function useKnownThreatsRestorePath( { siteId, rewindId, enabled }: RestoreTarget ) {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const { data, isSuccess } = useQuery( {
		...siteBackupKnownThreatsQuery( siteId, rewindId ?? '' ),
		enabled: enabled && !! rewindId,
	} );

	if ( ! enabled || ! rewindId || ! siteSlug ) {
		return null;
	}

	return isSuccess && ! isFlagged( data.knownThreats )
		? null
		: backupRestorePath( siteSlug, rewindId );
}

export function withKnownThreatsRestorePath< P extends object >(
	getTarget: ( props: P ) => RestoreTarget
) {
	return ( Wrapped: ComponentType< P & KnownThreatsRestorePathProps > ) =>
		function WithKnownThreatsRestorePath( props: P ) {
			const knownThreatsRestorePath = useKnownThreatsRestorePath( getTarget( props ) );
			return <Wrapped { ...props } knownThreatsRestorePath={ knownThreatsRestorePath } />;
		};
}
