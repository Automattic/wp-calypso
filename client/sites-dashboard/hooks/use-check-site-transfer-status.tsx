import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';

interface SiteTransferStatusProps {
	siteId: number | null;
	intervalTime?: number;
}

export const useCheckSiteTransferStatus = ( {
	siteId,
	intervalTime = 3000,
}: SiteTransferStatusProps ) => {
	const dispatch = useDispatch();

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	const isTransferCompleted = transferStatus === transferStates.COMPLETE;
	const isTransferring =
		transferStatus !== null && transferStatus !== transferStates.NONE && ! isTransferCompleted;
	const isErrored =
		transferStatus === transferStates.ERROR || transferStatus === transferStates.FAILURE;

	const [ wasTransferring, setWasTransferring ] = useState( false );
	const dismissTransferNoticeRef = useRef< NodeJS.Timeout >();

	useEffect( () => {
		if ( ! siteId || transferStatus === transferStates.COMPLETE ) {
			return;
		}

		if ( ! isFetchingTransferStatus ) {
			const intervalId = setInterval( () => {
				dispatch( fetchAutomatedTransferStatus( siteId ) );
			}, intervalTime );

			return () => clearInterval( intervalId );
		}
	}, [ siteId, dispatch, transferStatus, isFetchingTransferStatus, intervalTime ] );

	useEffect( () => {
		if ( siteId ) {
			dispatch( fetchAutomatedTransferStatus( siteId ) );
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
