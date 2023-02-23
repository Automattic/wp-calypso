import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';

export const useCheckStagingSiteStatus = ( siteId: number ) => {
	const dispatch = useDispatch();

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	useEffect( () => {
		if ( ! siteId || transferStatus === transferStates.COMPLETE ) {
			return;
		}
		if ( ! isFetchingTransferStatus ) {
			waitFor( 5 ).then( () => dispatch( fetchAutomatedTransferStatus( siteId ) ) );
		}
	}, [ siteId, dispatch, transferStatus, isFetchingTransferStatus ] );

	return transferStatus;
};
