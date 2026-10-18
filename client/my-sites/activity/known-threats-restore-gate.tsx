import { isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { speak } from '@wordpress/a11y';
import { VisuallyHidden } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useId } from 'react';
import { backupRestorePath } from 'calypso/my-sites/backup/paths';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import type { ComponentType } from 'react';

interface RestoreTarget {
	siteId: number;
	rewindId?: string | null;
	enabled: boolean;
}

/** Why a restore goes to the restore page: the backup has known threats, or couldn't be checked. */
export type KnownThreatsRestoreReason = 'known-threats' | 'unchecked';

export interface KnownThreatsRestorePathProps {
	knownThreatsRestorePath: string | null;
	knownThreatsCheckPending: boolean;
	knownThreatsRestoreReason: KnownThreatsRestoreReason | null;
	/** What the gated button will do differently, for its aria-describedby; null when nothing. */
	knownThreatsRestoreHint: string | null;
	/** An id to render `knownThreatsRestoreHint` under, with `KnownThreatsRestoreHint`. */
	knownThreatsRestoreHintId: string;
}

/**
 * Decides whether a restore of `rewindId` must go through the acknowledgement on the restore
 * page. `pending` is true until that can be decided; callers must not restore meanwhile.
 * `restorePath` is set when the backup has known threats or its counts failed to load, and
 * `reason` says which.
 */
export function useKnownThreatsRestorePath( { siteId, rewindId, enabled }: RestoreTarget ): {
	pending: boolean;
	restorePath: string | null;
	reason: KnownThreatsRestoreReason | null;
} {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const { data, isSuccess, isError } = useQuery( {
		...siteBackupKnownThreatsQuery( siteId, rewindId ?? '' ),
		enabled: enabled && !! rewindId,
	} );

	if ( ! enabled || ! rewindId ) {
		return { pending: false, restorePath: null, reason: null };
	}

	if ( ! siteSlug || ( ! isSuccess && ! isError ) ) {
		return { pending: true, restorePath: null, reason: null };
	}

	let reason: KnownThreatsRestoreReason | null = null;
	if ( isError ) {
		reason = 'unchecked';
	} else if ( isFlagged( data?.knownThreats ) ) {
		reason = 'known-threats';
	}

	return {
		pending: false,
		restorePath: reason ? backupRestorePath( siteSlug, rewindId ) : null,
		reason,
	};
}

// What a gated restore button will do differently: wait for the check, or go to the restore page.
function useKnownThreatsRestoreHint(
	pending: boolean,
	reason: KnownThreatsRestoreReason | null
): string | null {
	const translate = useTranslate();
	if ( pending ) {
		return translate( 'Checking this backup for known security threats…' ) as string;
	}
	if ( reason === 'known-threats' ) {
		return translate(
			"This backup contains known security threats. You'll review them before restoring."
		) as string;
	}
	if ( reason === 'unchecked' ) {
		return translate(
			"This backup couldn't be checked for known security threats. You'll continue on the restore page."
		) as string;
	}
	return null;
}

/** Renders `knownThreatsRestoreHint` for screen readers, to be pointed at by aria-describedby. */
export function KnownThreatsRestoreHint( { id, hint }: { id: string; hint: string | null } ) {
	return hint ? <VisuallyHidden id={ id }>{ hint }</VisuallyHidden> : null;
}

/** Says why the page is changing, then goes to the restore page. */
export function goToKnownThreatsRestorePath( path: string, hint: string | null ) {
	if ( hint ) {
		speak( hint, 'assertive' );
	}
	page( path );
}

export function withKnownThreatsRestorePath< P extends object >(
	getTarget: ( props: P ) => RestoreTarget
) {
	return ( Wrapped: ComponentType< P & KnownThreatsRestorePathProps > ) =>
		function WithKnownThreatsRestorePath( props: P ) {
			const { pending, restorePath, reason } = useKnownThreatsRestorePath( getTarget( props ) );
			const hint = useKnownThreatsRestoreHint( pending, reason );
			const hintId = useId();
			return (
				<Wrapped
					{ ...props }
					knownThreatsRestorePath={ restorePath }
					knownThreatsCheckPending={ pending }
					knownThreatsRestoreReason={ reason }
					knownThreatsRestoreHint={ hint }
					knownThreatsRestoreHintId={ hintId }
				/>
			);
		};
}
