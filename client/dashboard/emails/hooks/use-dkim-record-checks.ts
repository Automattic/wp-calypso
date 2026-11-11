import { titanDkimStatusQuery, titanDkimStatusRecheckMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useEffect, useState } from 'react';
import type { TitanDkimRecord, TitanDkimStatus } from '@automattic/api-core';

export const DKIM_POLL_INTERVAL = 3000;
export const DKIM_POLL_TIMEOUT = 30000;

export type DkimMissingEntry = TitanDkimStatus & { record: TitanDkimRecord };

const isMissing = ( entry: TitanDkimStatus ): entry is DkimMissingEntry =>
	entry.status === 'missing' && !! entry.record;

/**
 * Returns the domains whose DKIM record is missing. `onCheckAgain` queues a new check for all
 * of them and polls the status until each one has a new result, or the time runs out.
 */
export function useDkimRecordChecks( enabled: boolean ) {
	const { createSuccessNotice } = useDispatch( noticesStore );
	// Each rechecked domain's `checked_at` before the recheck, or null when no check is running.
	const [ checkedAtBefore, setCheckedAtBefore ] = useState< Record<
		string,
		string | null
	> | null >( null );
	const [ showTryLater, setShowTryLater ] = useState( false );
	const isChecking = checkedAtBefore !== null;

	const { data } = useQuery( {
		...titanDkimStatusQuery(),
		enabled,
		// The route loader already fetched it.
		refetchOnMount: false,
		refetchInterval: isChecking ? DKIM_POLL_INTERVAL : false,
	} );
	const entries = enabled && Array.isArray( data ) ? data.filter( isMissing ) : [];

	const { mutate: recheck } = useMutation( titanDkimStatusRecheckMutation() );

	const endCheck = useCallback( ( tryLater: boolean ) => {
		setCheckedAtBefore( null );
		setShowTryLater( tryLater );
	}, [] );

	const onCheckAgain = () => {
		setShowTryLater( false );
		setCheckedAtBefore(
			Object.fromEntries( entries.map( ( entry ) => [ entry.domain, entry.checked_at ] ) )
		);
		recheck( undefined, { onError: () => endCheck( true ) } );
	};

	useEffect( () => {
		if ( ! checkedAtBefore ) {
			return;
		}
		const latest = Array.isArray( data ) ? data : [];
		const rechecked = Object.entries( checkedAtBefore ).map( ( [ domain, checkedAt ] ) => ( {
			entry: latest.find( ( status ) => status.domain === domain ),
			checkedAt,
		} ) );
		if ( rechecked.some( ( { entry, checkedAt } ) => entry && entry.checked_at === checkedAt ) ) {
			return;
		}

		const found = rechecked.flatMap( ( { entry } ) =>
			entry?.status === 'found' ? [ entry ] : []
		);
		if ( found.length ) {
			createSuccessNotice(
				found.length === 1
					? sprintf(
							/* translators: %s is a domain name */
							__( 'We found the DKIM record for %s.' ),
							found[ 0 ].domain
						)
					: sprintf(
							/* translators: %s is the number of domains */
							_n(
								'We found the DKIM record for %s domain.',
								'We found the DKIM records for %s domains.',
								found.length
							),
							formatNumber( found.length )
						),
				{ type: 'snackbar' }
			);
		}
		endCheck( rechecked.some( ( { entry } ) => entry?.status === 'missing' ) );
	}, [ checkedAtBefore, data, createSuccessNotice, endCheck ] );

	useEffect( () => {
		if ( ! isChecking ) {
			return;
		}
		const timerId = window.setTimeout( () => endCheck( true ), DKIM_POLL_TIMEOUT );
		return () => window.clearTimeout( timerId );
	}, [ isChecking, endCheck ] );

	return { entries, isChecking, showTryLater, onCheckAgain };
}
