import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { transferStates } from 'calypso/state/atomic/transfers/constants';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';

interface SiteTransferStatusProps {
	siteId: number;
	intervalTime?: number;
}

const activeTransferStatuses = [
	transferStates.PENDING,
	transferStates.ACTIVE,
	transferStates.PROVISIONED,
	transferStates.RELOCATING_SWITCHEROO,
] as const;

const isTransferInProgress = ( transferStatus: string | null ) => {
	if ( ! transferStatus ) {
		return false;
	}

	const typedTransferStatus = transferStatus as ( typeof activeTransferStatuses )[ number ];

	return activeTransferStatuses.includes( typedTransferStatus );
};

export const useCheckSiteTransferStatus = ( {
	siteId,
	intervalTime = 3000,
}: SiteTransferStatusProps ) => {
	const dispatch = useDispatch();

	const transferStatus = useSelector(
		( state ) => getLatestAtomicTransfer( state, siteId ).transfer?.status ?? null
	);

	const isTransferCompleted = transferStatus === transferStates.COMPLETED;
	const isTransferring = isTransferInProgress( transferStatus );
	const isErrored = transferStatus === transferStates.ERROR;

	const [ wasTransferring, setWasTransferring ] = useState( false );
	const dismissTransferNoticeRef = useRef< NodeJS.Timeout >();

	useEffect( () => {
		if ( ! isTransferring ) {
			return;
		}

		const intervalId = setInterval( () => {
			dispatch( requestLatestAtomicTransfer( siteId ) );
		}, intervalTime );

		return () => clearInterval( intervalId );
	}, [ siteId, dispatch, isTransferring, intervalTime ] );

	useEffect( () => {
		dispatch( requestLatestAtomicTransfer( siteId ) );
	}, [ isTransferCompleted, siteId, dispatch ] );

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
