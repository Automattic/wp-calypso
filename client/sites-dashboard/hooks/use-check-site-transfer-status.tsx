import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { transferStates } from 'calypso/state/atomic/transfers/constants';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';
import { requestSite } from 'calypso/state/sites/actions';

interface SiteTransferStatusProps {
	siteId: number;
	intervalTime?: number;
}

// Matches the deadline the other transfer waits got in DOTCOM-17961/17962.
const TRANSFER_DEADLINE_MS = 5 * 60 * 1000;

const activeTransferStatuses = [
	transferStates.PENDING,
	transferStates.ACTIVE,
	transferStates.PROVISIONED,
	transferStates.RELOCATING_SWITCHEROO,
] as const;

// The lossless-revert family, plus the two finished failures. The site is on its way back to
// Simple, so the row has to stop showing an activation in progress.
const failedTransferStatuses = [
	transferStates.ERROR,
	transferStates.REVERTED,
	transferStates.REVERTING,
	transferStates.RELOCATING_REVERT,
	transferStates.RENAMING,
	transferStates.EXPORTING,
	transferStates.IMPORTING,
	transferStates.CLEANUP,
] as const;

const isTransferInProgress = ( transferStatus: string | null ) => {
	if ( ! transferStatus ) {
		return false;
	}

	const typedTransferStatus = transferStatus as ( typeof activeTransferStatuses )[ number ];

	return activeTransferStatuses.includes( typedTransferStatus );
};

const isTransferFailed = ( transferStatus: string | null ) => {
	if ( ! transferStatus ) {
		return false;
	}

	const typedTransferStatus = transferStatus as ( typeof failedTransferStatuses )[ number ];

	return failedTransferStatuses.includes( typedTransferStatus );
};

export const useCheckSiteTransferStatus = ( {
	siteId,
	intervalTime = 3000,
}: SiteTransferStatusProps ) => {
	const dispatch = useDispatch();

	const transfer = useSelector( ( state ) => getLatestAtomicTransfer( state, siteId ).transfer );
	const transferStatus = transfer?.status ?? null;

	// Keyed by site so a switch cannot inherit the previous site's verdict.
	const [ stalledSiteId, setStalledSiteId ] = useState< number | null >( null );
	const hasStalled = stalledSiteId === siteId;

	const isTransferCompleted = transferStatus === transferStates.COMPLETED;
	// `is_stuck` is the server's own verdict, so a long-abandoned transfer never starts a poll here.
	const isTransferring =
		! hasStalled && ! transfer?.is_stuck && isTransferInProgress( transferStatus );
	const isErrored = isTransferFailed( transferStatus );

	const [ wasTransferring, setWasTransferring ] = useState( false );

	useEffect( () => {
		dispatch( requestLatestAtomicTransfer( siteId ) );
	}, [ siteId, dispatch ] );

	useEffect( () => {
		if ( ! isTransferring ) {
			return;
		}

		// Wall clock, so a throttled background tab cannot stretch the bound.
		const watchingSince = Date.now();

		const intervalId = setInterval( () => {
			if ( Date.now() - watchingSince >= TRANSFER_DEADLINE_MS ) {
				setStalledSiteId( siteId );
				return;
			}

			dispatch( requestLatestAtomicTransfer( siteId ) );
		}, intervalTime );

		return () => clearInterval( intervalId );
	}, [ siteId, dispatch, isTransferring, intervalTime ] );

	useEffect( () => {
		if ( isTransferring && ! wasTransferring ) {
			setWasTransferring( true );
		}
	}, [ isTransferring, wasTransferring ] );

	useEffect( () => {
		if ( ! isTransferring && wasTransferring && isTransferCompleted ) {
			const dismissTransferNoticeTimeout = setTimeout( () => {
				dispatch( requestSite( siteId ) );
				setWasTransferring( false );
			}, 3000 );

			return () => {
				clearTimeout( dismissTransferNoticeTimeout );
			};
		}
	}, [ isTransferring, wasTransferring, isTransferCompleted ] );

	return {
		transferStatus,
		isTransferring,
		isTransferCompleted,
		isErrored,
		// Once the wait has run out the row stops claiming anything and falls back to its own status.
		wasTransferring: wasTransferring && ! hasStalled,
	};
};
