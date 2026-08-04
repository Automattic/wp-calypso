import { siteLatestAtomicTransferQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import type { AtomicTransfer } from '@automattic/api-core';

// Real transfers are p50 ~35s and p95 ~75s, with none over 180s in 28 days, so five minutes cuts
// off no legitimate wait while still bounding one that will never end.
export const INSTALL_DEADLINE_MS = 5 * 60 * 1000;

const TICK_MS = 5000;
const TRANSFER_POLL_MS = 10000;

// A transfer this old cannot belong to the attempt in front of the customer, so its status is not
// evidence about it. Generous because the checkout-initiated transfer starts server-side, before
// this page is ever mounted.
const TRANSFER_LOOKBACK_MS = 30 * 60 * 1000;

// A checkout transfer starts server-side moments before this page mounts, so a failure it suffered
// in that gap is still this attempt's failure. Kept short: it is also how long after a failed
// attempt a retry could still mistake the old transfer for its own.
const PRE_MOUNT_GRACE_MS = 2 * 60 * 1000;

// Statuses that only ever follow a transfer that could not be completed.
const FAILED_TRANSFER_STATUSES: ReadonlySet< string > = new Set( [
	'error',
	'reverted',
	'reverting',
	'relocating_revert',
] );

const SETTLED_TRANSFER_STATUSES: ReadonlySet< string > = new Set( [
	'completed',
	...FAILED_TRANSFER_STATUSES,
] );

// A zip upload has no product slug of its own to key its deadline on.
export const UPLOAD_ANCHOR_SLUG = 'upload';

const anchorKey = ( siteId: number, productSlug: string ) =>
	`marketplace-install-started-at:${ siteId }:${ productSlug }`;

function writeAnchor( siteId: number, productSlug: string, startedAt: number ): void {
	try {
		window.sessionStorage.setItem( anchorKey( siteId, productSlug ), String( startedAt ) );
	} catch {
		// Private-mode sessionStorage throws; the in-memory anchor still bounds this mount.
	}
}

/**
 * The moment this install attempt began, kept in sessionStorage so it survives the page refresh
 * that is the natural reaction to a bar that has stopped moving. Per-tab, so a later attempt in a
 * new tab starts its own clock; `clearInstallAnchor` retires it when an attempt finishes.
 */
function readOrCreateAnchor( siteId: number, productSlug: string, now: number ): number {
	const key = anchorKey( siteId, productSlug );
	try {
		const stored = Number( window.sessionStorage.getItem( key ) );
		// A stored anchor older than the lookback is a leftover from an attempt that already ended
		// without clearing (a crash, a closed error screen), not a wait still in progress.
		if ( stored && now - stored < TRANSFER_LOOKBACK_MS ) {
			return stored;
		}
	} catch {
		// Fall through to a fresh anchor.
	}
	writeAnchor( siteId, productSlug, now );
	return now;
}

export function clearInstallAnchor( siteId: number, productSlug: string ): void {
	try {
		window.sessionStorage.removeItem( anchorKey( siteId, productSlug ) );
	} catch {
		// Nothing to clean up if storage is unavailable.
	}
}

type HaltedOutcome = 'timeout' | 'transfer-failed';

/**
 * Bounds the install wait and reports a transfer that has genuinely failed.
 *
 * The deadline is anchored to durable state — the server's own record of when the current transfer
 * started, falling back to a sessionStorage stamp — rather than to a timer started at mount, which
 * a refresh would reset and a backgrounded tab would stretch.
 *
 * A failed transfer is only reported as this attempt's failure when it can be tied to the attempt:
 * either this mount watched it running first, or it started within the pre-mount grace of the
 * anchor. Without that, a retry mounted while the previous attempt's failed transfer is still the
 * site's latest would error instantly — a real path on the upload flow, where the new transfer is
 * not created until the upload finishes.
 *
 * Once the wait is called off the anchor is retired, so a retry starts a fresh clock; a newer
 * transfer than the anchor also moves the clock to it. The trade-off: refreshing the error screen
 * re-arms one bounded clock rather than restoring the error immediately — acceptable next to the
 * unbounded bar this replaces.
 */
export function useInstallDeadline( {
	siteId,
	productSlug,
	enabled,
}: {
	siteId: number;
	productSlug: string;
	enabled: boolean;
} ): { hasTimedOut: boolean; hasTransferFailed: boolean } {
	const [ now, setNow ] = useState( () => Date.now() );
	const [ anchor, setAnchor ] = useState< number | null >( null );
	// Latched so the wait cannot silently resume once it has been called off, and so the polling
	// below stops for good rather than running behind an error screen.
	const [ haltedOutcome, setHaltedOutcome ] = useState< HaltedOutcome | null >( null );
	// Whether this mount has watched the attempt's transfer running, which is what ties a later
	// failure of the same record to this attempt.
	const [ witnessedInFlight, setWitnessedInFlight ] = useState( false );

	const isHalted = haltedOutcome !== null;

	useEffect( () => {
		if ( ! enabled || ! siteId || anchor !== null ) {
			return;
		}
		setAnchor( readOrCreateAnchor( siteId, productSlug, Date.now() ) );
	}, [ enabled, siteId, productSlug, anchor ] );

	const {
		data: transfer,
		isFetched,
		isError,
	} = useQuery( {
		...siteLatestAtomicTransferQuery( siteId ),
		enabled: enabled && !! siteId && ! isHalted,
		refetchInterval: ( query ) =>
			isSettled( query.state.data as AtomicTransfer | undefined ) ? false : TRANSFER_POLL_MS,
		// A 404 means this site has never transferred, which is an answer, not an outage.
		retry: ( count, error ) => ( error as { status?: number } )?.status !== 404 && count < 2,
	} );

	const transferStartedAt = transfer?.created_at ? Date.parse( transfer.created_at ) : NaN;
	const isRecentTransfer =
		! Number.isNaN( transferStartedAt ) && now - transferStartedAt < TRANSFER_LOOKBACK_MS;
	const isFailedTransfer =
		isRecentTransfer && FAILED_TRANSFER_STATUSES.has( transfer?.status ?? '' );

	// A transfer newer than the anchor is a new attempt started server-side — a retry after a
	// failed or timed-out install — so the wait's clock moves to it. Derived rather than set in an
	// effect, so the deadline below never evaluates against the stale anchor.
	const effectiveAnchor =
		anchor !== null && isRecentTransfer && transferStartedAt > anchor ? transferStartedAt : anchor;

	// Persist the move so a refresh keeps the newer clock too.
	useEffect( () => {
		if ( ! isHalted && effectiveAnchor !== anchor ) {
			writeAnchor( siteId, productSlug, effectiveAnchor as number );
		}
	}, [ isHalted, effectiveAnchor, anchor, siteId, productSlug ] );

	useEffect( () => {
		if ( isRecentTransfer && ! FAILED_TRANSFER_STATUSES.has( transfer?.status ?? '' ) ) {
			setWitnessedInFlight( true );
		}
	}, [ isRecentTransfer, transfer?.status ] );

	// The wait started at whichever we can see first: the transfer checkout kicked off before this
	// page existed, or this page's own arrival.
	const knownStarts = [ effectiveAnchor, isRecentTransfer ? transferStartedAt : null ].filter(
		( value ): value is number => value !== null
	);
	const waitStartedAt = knownStarts.length ? Math.min( ...knownStarts ) : null;

	const startedWithThisAttempt =
		isRecentTransfer &&
		effectiveAnchor !== null &&
		transferStartedAt >= effectiveAnchor - PRE_MOUNT_GRACE_MS;

	const isFailureDetected =
		enabled && isFailedTransfer && ( witnessedInFlight || startedWithThisAttempt );
	// The deadline waits for the first transfer response: a retry can mount with a stale anchor,
	// and only that response reveals the newer transfer the clock should move to.
	const isDeadlineExceeded =
		enabled &&
		waitStartedAt !== null &&
		( isFetched || isError ) &&
		now - waitStartedAt > INSTALL_DEADLINE_MS;

	useEffect( () => {
		if ( isFailureDetected ) {
			setHaltedOutcome( 'transfer-failed' );
		} else if ( isDeadlineExceeded ) {
			setHaltedOutcome( 'timeout' );
		}
	}, [ isFailureDetected, isDeadlineExceeded ] );

	// Retire the anchor once the wait is called off so a retry cannot inherit this attempt's clock.
	useEffect( () => {
		if ( haltedOutcome ) {
			clearInstallAnchor( siteId, productSlug );
		}
	}, [ haltedOutcome, siteId, productSlug ] );

	useInterval( () => setNow( Date.now() ), enabled && ! isHalted ? TICK_MS : null );

	return {
		hasTimedOut: haltedOutcome === 'timeout' || isDeadlineExceeded,
		hasTransferFailed: haltedOutcome === 'transfer-failed' || isFailureDetected,
	};
}

function isSettled( transfer: AtomicTransfer | undefined ): boolean {
	return !! transfer && SETTLED_TRANSFER_STATUSES.has( transfer.status );
}
