import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';

interface SiteTransferStatusProps {
	siteId: number;
	intervalTime?: number;
}

const terminatedTransferStatuses = [
	transferStates.NONE,
	transferStates.ERROR,
	transferStates.FAILURE,
	transferStates.REVERTED,
	transferStates.COMPLETE,
] as const;

const isTransferInProgress = ( transferStatus: string | null ) => {
	if ( ! transferStatus ) {
		return false;
	}

	const terminatedTransferStatus =
		transferStatus as ( typeof terminatedTransferStatuses )[ number ];

	return ! terminatedTransferStatuses.includes( terminatedTransferStatus );
};

export const useCheckSiteTransferStatus = ( {
	siteId,
	intervalTime = 3000,
}: SiteTransferStatusProps ) => {
	const dispatch = useDispatch();

	const transferStatus = useSelector(
		( state ) => getLatestAtomicTransfer( state, siteId ).transfer?.status ?? null
	);

	const isTransferCompleted = transferStatus === transferStates.COMPLETE;
	const isTransferring = isTransferInProgress( transferStatus );
	const isErrored =
		transferStatus === transferStates.ERROR || transferStatus === transferStates.FAILURE;

	const [ wasTransferring, setWasTransferring ] = useState( false );
	const dismissTransferNoticeRef = useRef< NodeJS.Timeout >();

	useEffect( () => {
		if ( ! isTransferInProgress( transferStatus ) ) {
			return;
		}

		const intervalId = setInterval( () => {
			dispatch( requestLatestAtomicTransfer( siteId ) );
		}, intervalTime );

		return () => clearInterval( intervalId );
	}, [ siteId, dispatch, transferStatus, isTransferCompleted, intervalTime ] );

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestLatestAtomicTransfer( siteId ) );
		}
	}, [ siteId, dispatch ] );

	useEffect( () => {
		if ( isTransferring && ! wasTransferring ) {
			setWasTransferring( true );
		} else if ( ! isTransferring && wasTransferring && isTransferCompleted ) {
			dismissTransferNoticeRef.current = setTimeout( () => {
				setWasTransferring( false );
			}, 3000 );
		}

		return () => clearTimeout( dismissTransferNoticeRef.current );
	}, [ isTransferring, isTransferCompleted, wasTransferring, setWasTransferring ] );

	return {
		transferStatus,
		isTransferring,
		isTransferCompleted,
		isErrored,
		wasTransferring,
	};
};
