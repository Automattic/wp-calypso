import { titanDkimStatusQuery, titanDkimStatusRecheckMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import type { TitanDkimRecord, TitanDkimStatus } from '@automattic/api-core';

export const DKIM_POLL_INTERVAL = 3000;
export const DKIM_POLL_TIMEOUT = 30000;

export type DkimMissingEntry = TitanDkimStatus & { record: TitanDkimRecord };

const isMissing = ( entry: TitanDkimStatus ): entry is DkimMissingEntry =>
	entry.status === 'missing' && !! entry.record;

const isNeverChecked = ( entry: TitanDkimStatus ) =>
	entry.status === 'unknown' && entry.checked_at === null;

/**
 * Returns the domains whose DKIM record is missing. `onCheckAgain` queues a new check for all
 * of them and polls the status until each one has a new result, or the time runs out.
 *
 * The first request for a never-checked domain queues its check and returns `unknown`, so the
 * status is also polled after page load until that check has a result, or the time runs out.
 */
export function useDkimRecordChecks( enabled: boolean ) {
	const { createSuccessNotice } = useDispatch( noticesStore );
	// Each rechecked domain's `checked_at` before the recheck, or null when no check is running.
	const [ checkedAtBefore, setCheckedAtBefore ] = useState< Record<
		string,
		string | null
	> | null >( null );
	// Set when the time runs out or the recheck request fails, to end the check with what we have.
	const [ isGivingUp, setIsGivingUp ] = useState( false );
	const [ showTryLater, setShowTryLater ] = useState( false );
	const [ mountedAt ] = useState( () => Date.now() );
	const isChecking = checkedAtBefore !== null;

	const { data } = useQuery( {
		...titanDkimStatusQuery(),
		enabled,
		// The route loader already fetched it.
		refetchOnMount: false,
		refetchInterval: ( query ) => {
			if ( isChecking ) {
				return DKIM_POLL_INTERVAL;
			}
			const statuses = query.state.data;
			const isWaitingForFirstCheck =
				Array.isArray( statuses ) &&
				statuses.some( isNeverChecked ) &&
				Date.now() - mountedAt < DKIM_POLL_TIMEOUT;
			return isWaitingForFirstCheck ? DKIM_POLL_INTERVAL : false;
		},
	} );
	const entries = enabled && Array.isArray( data ) ? data.filter( isMissing ) : [];

	const { mutate: recheck } = useMutation( titanDkimStatusRecheckMutation() );

	const onCheckAgain = () => {
		setShowTryLater( false );
		setIsGivingUp( false );
		setCheckedAtBefore(
			Object.fromEntries( entries.map( ( entry ) => [ entry.domain, entry.checked_at ] ) )
		);
		recheck( undefined, { onError: () => setIsGivingUp( true ) } );
	};

	useEffect( () => {
		if ( ! checkedAtBefore ) {
			return;
		}
		const latest = Array.isArray( data ) ? data : [];
		const results = Object.entries( checkedAtBefore ).map( ( [ domain, checkedAt ] ) => {
			const entry = latest.find( ( status ) => status.domain === domain );
			return { entry, hasNewResult: ! entry || entry.checked_at !== checkedAt };
		} );
		if ( ! isGivingUp && results.some( ( { hasNewResult } ) => ! hasNewResult ) ) {
			return;
		}

		const found = results.flatMap( ( { entry, hasNewResult } ) =>
			hasNewResult && entry?.status === 'found' ? [ entry ] : []
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
		setCheckedAtBefore( null );
		setIsGivingUp( false );
		setShowTryLater( results.some( ( { entry } ) => entry?.status === 'missing' ) );
	}, [ checkedAtBefore, isGivingUp, data, createSuccessNotice ] );

	useEffect( () => {
		if ( ! isChecking ) {
			return;
		}
		const timerId = window.setTimeout( () => setIsGivingUp( true ), DKIM_POLL_TIMEOUT );
		return () => window.clearTimeout( timerId );
	}, [ isChecking ] );

	return { entries, isChecking, showTryLater, onCheckAgain };
}
