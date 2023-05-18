import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';

interface SiteTransferStatusProps {
	site: SiteExcerptData;
	intervalTime?: number;
}

export const useCheckSiteTransferStatus = ( {
	site,
	intervalTime = 3000,
}: SiteTransferStatusProps ) => {
	const dispatch = useDispatch();
	const { ID: siteId, is_wpcom_atomic: isAtomic } = site;

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	const isTransferCompleted = transferStatus === transferStates.COMPLETE;
	const isTransferring =
		transferStatus !== null && transferStatus !== transferStates.NONE && ! isTransferCompleted;

	const intervalRef = useRef< NodeJS.Timeout >();

	useEffect( () => {
		if ( ! isAtomic || ! siteId || transferStatus === transferStates.COMPLETE ) {
			return;
		}

		if ( ! isFetchingTransferStatus ) {
			intervalRef.current = setInterval( () => {
				dispatch( fetchAutomatedTransferStatus( siteId ) );
			}, intervalTime );
		}

		return () => clearInterval( intervalRef.current );
	}, [ siteId, dispatch, transferStatus, isFetchingTransferStatus, intervalTime, isAtomic ] );

	useEffect( () => {
		if ( siteId && isAtomic ) {
			dispatch( fetchAutomatedTransferStatus( siteId ) );
		}
	}, [ siteId, dispatch, isAtomic ] );

	return { transferStatus, isTransferring, isTransferCompleted };
};
