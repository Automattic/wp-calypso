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
	// Null while the wait is not running. The clock is stamped when it starts, never while it is
	// stopped, so time spent waiting for something else — a browser upload finishing — is not
	// charged to it. Nothing is evaluated until this commits, so no render can time out on the
	// previous attempt's stamp.
	const [ waitBeganAt, setWaitBeganAt ] = useState< number | null >( () =>
		enabled ? Date.now() : null
	);
	const [ haltedOutcome, setHaltedOutcome ] = useState< HaltedOutcome | null >( null );
	const [ failureSeen, setFailureSeen ] = useState( false );

	const isRevertOfThisTransfer = useRef( createRevertedTransferWatcher() );
	// The id of a transfer this wait has watched running, which is what makes its later failure ours.
	const seenInFlightId = useRef< number | undefined >( undefined );

	const isHalted = haltedOutcome !== null;
	const isRunning = enabled && waitBeganAt !== null;

	useEffect( () => {
		if ( enabled && waitBeganAt === null ) {
			// Starting, or resuming after whatever stopped it. Either way this is a fresh attempt.
			isRevertOfThisTransfer.current = createRevertedTransferWatcher();
			seenInFlightId.current = undefined;
			setHaltedOutcome( null );
			setFailureSeen( false );
			setWaitBeganAt( Date.now() );
		} else if ( ! enabled && waitBeganAt !== null ) {
			// The wait stopped before it resolved — an error took over, or its authorization went
			// away. Retire it so the clock restarts rather than counting the gap.
			setWaitBeganAt( null );
		}
	}, [ enabled, waitBeganAt ] );

	// `isFetchedAfterMount`, not `isFetched`: the latter is satisfied by whatever this query already
	// had in cache, which for a long-lived page can be a transfer snapshot old enough to blow the
	// deadline the moment this mounts — latching a timeout on an install that has since completed.
	const {
		data: transfer,
		isFetchedAfterMount,
		isSuccess,
	} = useQuery( {
		...siteLatestAtomicTransferQuery( siteId ),
		enabled: isRunning && !! siteId && ! isHalted,
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
	const hasFreshInFlightTransfer = isFetchedAfterMount && isSuccess && isInFlight;

	useEffect( () => {
		if ( ! transfer || waitBeganAt === null ) {
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
	const transferStartedAt = hasFreshInFlightTransfer ? Date.parse( transfer.created_at ) : NaN;
	const waitStartedAt =
		waitBeganAt === null
			? null
			: Math.min(
					Number.isNaN( transferStartedAt ) ? waitBeganAt : transferStartedAt,
					waitBeganAt
			  );

	const hasTransferFailed = isRunning && failureSeen;
	// Query freshness controls the transfer anchor above, not whether the deadline runs. Otherwise
	// an offline or indefinitely pending lookup would leave the wait unbounded.
	const isDeadlineExceeded =
		isRunning &&
		! hasTransferFailed &&
		waitStartedAt !== null &&
		now - waitStartedAt > INSTALL_DEADLINE_MS;

	useEffect( () => {
		if ( hasTransferFailed ) {
			setHaltedOutcome( 'transfer-failed' );
		} else if ( isDeadlineExceeded ) {
			setHaltedOutcome( 'timeout' );
		}
	}, [ hasTransferFailed, isDeadlineExceeded ] );

	useInterval( () => setNow( Date.now() ), isRunning && ! isHalted ? TICK_MS : null );

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
		waited_seconds: waitStartedAt === null ? 0 : Math.round( ( now - waitStartedAt ) / 1000 ),
		// Whether the durable anchor did any work, or the clock fell back to this page's own arrival.
		anchored_to: hasFreshInFlightTransfer ? 'transfer' : 'wait_start',
		deadline_seconds: Math.round( INSTALL_DEADLINE_MS / 1000 ),
	};

	return {
		hasTimedOut: haltedOutcome === 'timeout' || isDeadlineExceeded,
		hasTransferFailed: haltedOutcome === 'transfer-failed' || hasTransferFailed,
		diagnostics,
	};
}
