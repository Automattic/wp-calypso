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
	knownThreatsCheckPending: boolean;
}

/**
 * Decides whether a restore of `rewindId` must go through the acknowledgement on the restore
 * page. `pending` is true until that can be decided; callers must not restore meanwhile.
 * `restorePath` is set when the backup has known threats or its counts failed to load.
 */
export function useKnownThreatsRestorePath( { siteId, rewindId, enabled }: RestoreTarget ): {
	pending: boolean;
	restorePath: string | null;
} {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const { data, isSuccess, isError } = useQuery( {
		...siteBackupKnownThreatsQuery( siteId, rewindId ?? '' ),
		enabled: enabled && !! rewindId,
	} );

	if ( ! enabled || ! rewindId ) {
		return { pending: false, restorePath: null };
	}

	if ( ! siteSlug || ( ! isSuccess && ! isError ) ) {
		return { pending: true, restorePath: null };
	}

	return {
		pending: false,
		restorePath:
			isError || isFlagged( data?.knownThreats ) ? backupRestorePath( siteSlug, rewindId ) : null,
	};
}

export function withKnownThreatsRestorePath< P extends object >(
	getTarget: ( props: P ) => RestoreTarget
) {
	return ( Wrapped: ComponentType< P & KnownThreatsRestorePathProps > ) =>
		function WithKnownThreatsRestorePath( props: P ) {
			const { pending, restorePath } = useKnownThreatsRestorePath( getTarget( props ) );
			return (
				<Wrapped
					{ ...props }
					knownThreatsRestorePath={ restorePath }
					knownThreatsCheckPending={ pending }
				/>
			);
		};
}
