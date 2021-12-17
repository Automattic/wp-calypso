import page from 'page';
import { ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useInterval } from 'calypso/lib/interval/use-interval';
import { getSoftwareStatus, fetchSoftwareStatus } from 'calypso/state/atomic-v2/software';
import {
	getLatestTransfer,
	initiateTransfer,
	fetchLatestTransfer,
	transferStates,
} from 'calypso/state/atomic-v2/transfers';
import { getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Error from './error';
import Progress from './progress';

import './style.scss';

export default function TransferSite(): ReactElement | null {
	const dispatch = useDispatch();

	const [ progress, setProgress ] = useState( 0.1 );

	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const transfer = useSelector( ( state ) => getLatestTransfer( state, siteId ) );
	const transferStatus = transfer?.status;
	const transferFailed = !! transfer?.error;
	const software = useSelector( ( state ) => getSoftwareStatus( state, siteId, 'woo-on-plans' ) );
	const softwareApplied = software?.applied;
	const wcAdmin = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	// Initiate Atomic transfer or software install
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( initiateTransfer( siteId, { softwareSet: 'woo-on-plans' } ) );
	}, [ dispatch, siteId ] );

	// Poll for transfer status
	useInterval(
		() => {
			dispatch( fetchLatestTransfer( siteId ) );
		},
		transferStatus === transferStates.COMPLETED ? null : 3000
	);

	// Poll for software status
	useInterval(
		() => {
			dispatch( fetchSoftwareStatus( siteId, 'woo-on-plans' ) );
		},
		softwareApplied ? null : 3000
	);

	// Watch transfer status
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		switch ( transferStatus ) {
			case transferStates.PENDING:
				setProgress( 0.2 );
				break;
			case transferStates.ACTIVE:
				setProgress( 0.4 );
				break;
			case transferStates.PROVISIONED:
				setProgress( 0.5 );
				break;
			case transferStates.COMPLETED:
				setProgress( 0.7 );
				break;
		}

		if ( transferFailed || transferStatus === transferStates.ERROR ) {
			setProgress( 1 );
		}
	}, [ siteId, transferStatus, transferFailed ] );

	// Redirect to wc-admin once software installation is confirmed.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		if ( softwareApplied ) {
			setProgress( 1 );
			// Allow progress bar to complete
			setTimeout( () => {
				page( wcAdmin );
			}, 500 );
		}
	}, [ siteId, softwareApplied, wcAdmin ] );

	// todo: transferFailed states need testing and if required, pass the message through correctly
	return (
		<>
			{ transferFailed && <Error message={ transferStatus || '' } /> }
			{ ! transferFailed && <Progress progress={ progress } /> }
		</>
	);
}
