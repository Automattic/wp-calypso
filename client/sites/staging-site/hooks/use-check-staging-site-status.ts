import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';

export const useCheckStagingSiteStatus = ( siteId: number, isEnabled: boolean ) => {
	const dispatch = useDispatch();
	const [ isAutomatedTransferFetched, setIsAutomatedTransferFetched ] = useState( false );

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		if ( siteId && isAutomatedTransferFetched ) {
			return;
		}
		if ( ! isFetchingTransferStatus ) {
			// We don't need to polling as the reducer will do it for us
			dispatch( fetchAutomatedTransferStatus( siteId ) );
		}
		setIsAutomatedTransferFetched( true );
	}, [ dispatch, isFetchingTransferStatus, siteId, transferStatus, isAutomatedTransferFetched ] );

	if ( ( siteId && isFetchingTransferStatus ) || ! isEnabled ) {
		return '';
	}

	return transferStatus;
};
