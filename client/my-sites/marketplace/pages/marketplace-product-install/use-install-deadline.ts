import { siteLatestAtomicTransferQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
	createRevertedTransferWatcher,
	transferStates,
} from 'calypso/landing/stepper/utils/atomic-transfer-outcome';
import { useInterval } from 'calypso/lib/interval';
import type { AtomicTransfer } from '@automattic/api-core';

// Matches the wait in Stepper's useWaitForAtomic (1000 * 300), so both places give up on a transfer
// at the same point. Real transfers are p50 ~35s and p95 ~75s, so this cuts off no healthy wait.
export const INSTALL_DEADLINE_MS = 5 * 60 * 1000;

// Same cadence as Stepper's transfer wait.
const POLL_MS = 3000;

// Only for the clock display; the deadline itself is compared against wall time.
const TICK_MS = 5000;

const SETTLED_STATUSES: string[] = [
	transferStates.COMPLETED,
	transferStates.ERROR,
	transferStates.REVERTED,
	transferStates.REVERTING,
	transferStates.RELOCATING_REVERT,
];

const isSettled = ( status?: string ) => !! status && SETTLED_STATUSES.includes( status );

type HaltedOutcome = 'timeout' | 'transfer-failed';

export type InstallWaitDiagnostics = {
	has_transfer: boolean;
	transfer_status: string | null;
	transfer_age_seconds: number | null;
	transfer_is_stuck: boolean | null;
	transfer_in_lossless_revert: boolean | null;
	waited_seconds: number;
	anchored_to: 'transfer' | 'wait_start';
	deadline_seconds: number;
};

/**
 * Bounds the wait on this page and reports a transfer that has genuinely failed.
 *
 * A transfer still running is the one being waited on, so its own `created_at` anchors the
 * deadline: server-supplied, and therefore unchanged by the page refresh that is the natural
 * reaction to a bar that has stopped moving. Only when no transfer is in flight — an in-place
 * install, a theme — does the clock fall back to when this wait began, as Stepper's does.
 *
 * Failure attribution is the shared `createRevertedTransferWatcher`: the endpoint returns the
 * site's latest transfer rather than the one we asked about, so a revert counts as ours only once
 * we have watched that same transfer id in flight. An `error` is attributed the same way, or by
 * having started after this wait did.
 */
export function useInstallDeadline( { siteId, enabled }: { siteId: number; enabled: boolean } ): {
	hasTimedOut: boolean;
	hasTransferFailed: boolean;
	diagnostics: InstallWaitDiagnostics;
} {
	const [ now, setNow ] = useState( () => Date.now() );
	const [ waitBeganAt, setWaitBeganAt ] = useState( () => Date.now() );
	const [ haltedOutcome, setHaltedOutcome ] = useState< HaltedOutcome | null >( null );
	const [ failureSeen, setFailureSeen ] = useState( false );

	const isRevertOfThisTransfer = useRef( createRevertedTransferWatcher() );
	// The id of a transfer this wait has watched running, which is what makes its later failure ours.
	const seenInFlightId = useRef< number | undefined >( undefined );

	const isHalted = haltedOutcome !== null;

	// The wait stopped before it resolved — an error took over, or its authorization went away.
	// Retire the attempt so re-enabling starts a fresh clock rather than inheriting the elapsed one.
	useEffect( () => {
		if ( enabled ) {
			return;
		}
		isRevertOfThisTransfer.current = createRevertedTransferWatcher();
		seenInFlightId.current = undefined;
		setWaitBeganAt( Date.now() );
		setHaltedOutcome( null );
		setFailureSeen( false );
	}, [ enabled ] );

	const { data: transfer, isFetched } = useQuery( {
		...siteLatestAtomicTransferQuery( siteId ),
		enabled: enabled && !! siteId && ! isHalted,
		refetchInterval: ( query ) => {
			const latest = query.state.data as AtomicTransfer | undefined;
			// A settled record only ends the poll once it is this wait's. Otherwise it is the previous
			// attempt's, still the site's latest because ours has not been created yet.
			const isOurs =
				latest?.atomic_transfer_id !== undefined &&
				latest.atomic_transfer_id === seenInFlightId.current;
			return isSettled( latest?.status ) && isOurs ? false : POLL_MS;
		},
		// A site that has never transferred answers 404, which is an answer rather than an outage.
		retry: ( count, error ) => ( error as { status?: number } )?.status !== 404 && count < 2,
	} );

	const isInFlight = !! transfer && ! isSettled( transfer.status );

	useEffect( () => {
		if ( ! transfer ) {
			return;
		}
		const reverted = isRevertOfThisTransfer.current( transfer );
		if ( ! isSettled( transfer.status ) ) {
			seenInFlightId.current = transfer.atomic_transfer_id;
			return;
		}
		const startedDuringThisWait = Date.parse( transfer.created_at ) >= waitBeganAt;
		const isOurs = transfer.atomic_transfer_id === seenInFlightId.current || startedDuringThisWait;
		if ( reverted || ( transfer.status === transferStates.ERROR && isOurs ) ) {
			setFailureSeen( true );
		}
	}, [ transfer, waitBeganAt ] );

	// A live transfer is the thing being waited on, so it owns the clock; its start survives a
	// refresh where a mount-anchored timer would not.
	const transferStartedAt = isInFlight ? Date.parse( transfer.created_at ) : NaN;
	const waitStartedAt = Number.isNaN( transferStartedAt )
		? waitBeganAt
		: Math.min( transferStartedAt, waitBeganAt );

	const hasTransferFailed = enabled && failureSeen;
	// Waits for the first answer, so a mount cannot time out before it knows what it is waiting on.
	const isDeadlineExceeded =
		enabled && isFetched && ! hasTransferFailed && now - waitStartedAt > INSTALL_DEADLINE_MS;

	useEffect( () => {
		if ( hasTransferFailed ) {
			setHaltedOutcome( 'transfer-failed' );
		} else if ( isDeadlineExceeded ) {
			setHaltedOutcome( 'timeout' );
		}
	}, [ hasTransferFailed, isDeadlineExceeded ] );

	useInterval( () => setNow( Date.now() ), enabled && ! isHalted ? TICK_MS : null );

	// What the wait could see when it ended. `is_stuck` is the server's own verdict on the same
	// question this hook answers — in flight and older than its threshold — so recording both says
	// whether five minutes is measuring what the backend's thirty are.
	const transferAgeMs = transfer?.created_at ? now - Date.parse( transfer.created_at ) : null;
	const diagnostics: InstallWaitDiagnostics = {
		has_transfer: !! transfer,
		transfer_status: transfer?.status ?? null,
		transfer_age_seconds: transferAgeMs === null ? null : Math.round( transferAgeMs / 1000 ),
		transfer_is_stuck: transfer?.is_stuck ?? null,
		transfer_in_lossless_revert: transfer?.in_lossless_revert ?? null,
		waited_seconds: Math.round( ( now - waitStartedAt ) / 1000 ),
		// Whether the durable anchor did any work, or the clock fell back to this page's own arrival.
		anchored_to: isInFlight ? 'transfer' : 'wait_start',
		deadline_seconds: Math.round( INSTALL_DEADLINE_MS / 1000 ),
	};

	return {
		hasTimedOut: haltedOutcome === 'timeout' || isDeadlineExceeded,
		hasTransferFailed: haltedOutcome === 'transfer-failed' || hasTransferFailed,
		diagnostics,
	};
}
