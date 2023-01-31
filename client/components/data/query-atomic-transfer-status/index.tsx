import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';

interface QueryAtomicTransferStatusProps {
	siteId: number;
	onTransferComplete: CallableFunction;
}

const QueryAtomicTransferStatus = ( {
	siteId,
	onTransferComplete,
}: QueryAtomicTransferStatusProps ) => {
	const dispatch = useDispatch();
	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	useEffect( () => {
		if ( transferStatus === transferStates.COMPLETE || isJetpackSelfHosted ) {
			return onTransferComplete();
		}
		if ( ! isFetchingTransferStatus ) {
			waitFor( 2 ).then( () => dispatch( fetchAutomatedTransferStatus( siteId ) ) );
		}
	}, [ siteId, dispatch, transferStatus, isFetchingTransferStatus, isJetpackSelfHosted ] );

	return null;
};

export default QueryAtomicTransferStatus;
