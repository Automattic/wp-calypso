import page from 'page';
import { ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useInterval } from 'calypso/lib/interval/use-interval';
import { requestAtomicSoftwareStatus } from 'calypso/state/atomic/software/actions';
import { getAtomicSoftwareStatus } from 'calypso/state/atomic/software/selectors';
import {
	initiateAtomicTransfer,
	requestLatestAtomicTransfer,
} from 'calypso/state/atomic/transfers/actions';
import { transferStates } from 'calypso/state/atomic/transfers/constants';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';
import { getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Error from './error';
import Progress from './progress';
import './style.scss';
import { FailureInfo } from '.';

export default function TransferSite( {
	onFailure,
	trackRedirect,
}: {
	onFailure: ( type: FailureInfo ) => void;
	trackRedirect: () => void;
} ): ReactElement | null {
	const dispatch = useDispatch();

	const [ progress, setProgress ] = useState( 0.1 );

	// Store the transfer failure state.
	const [ transferFailed, setTransferFailed ] = useState( false );

	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;

	const wcAdmin = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	const { transfer, error: transferError } = useSelector( ( state ) =>
		getLatestAtomicTransfer( state, siteId )
	);
	const transferStatus = transfer?.status;

	const { status: softwareStatus, error: softwareError } = useSelector( ( state ) =>
		getAtomicSoftwareStatus( state, siteId, 'woo-on-plans' )
	);
	const softwareApplied = softwareStatus?.applied;

	// Check for error codes (5xx). 404's are not a failure mode.
	const isTransferringStatusFailed =
		( transferError && transferError?.status >= 500 ) ||
		( softwareError && softwareError?.status >= 500 );

	// Initiate Atomic transfer or software install
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( initiateAtomicTransfer( siteId, { softwareSet: 'woo-on-plans' } ) );
	}, [ dispatch, siteId ] );

	// Poll for transfer status
	useInterval(
		() => {
			dispatch( requestLatestAtomicTransfer( siteId ) );
		},
		transferFailed || isTransferringStatusFailed || transferStatus === transferStates.COMPLETED
			? null
			: 3000
	);

	// Poll for software status
	useInterval(
		() => {
			dispatch( requestAtomicSoftwareStatus( siteId, 'woo-on-plans' ) );
		},
		// Only poll if the transfer is completed and not failed
		transferFailed ||
			isTransferringStatusFailed ||
			transferStatus !== transferStates.COMPLETED ||
			softwareApplied
			? null
			: 3000
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

		if ( isTransferringStatusFailed || transferStatus === transferStates.ERROR ) {
			setProgress( 1 );
			setTransferFailed( true );

			onFailure( {
				type: 'transfer',
				error: transferError?.message || softwareError?.message || '',
				code: transferError?.code || softwareError?.code || '',
			} );
		}
	}, [
		siteId,
		transferStatus,
		isTransferringStatusFailed,
		onFailure,
		transferError,
		softwareError,
		softwareStatus,
	] );

	// Redirect to wc-admin once software installation is confirmed.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		if ( softwareApplied ) {
			trackRedirect();
			setProgress( 1 );
			// Allow progress bar to complete
			setTimeout( () => {
				page( wcAdmin );
			}, 500 );
		}
	}, [ siteId, softwareApplied, wcAdmin, trackRedirect ] );

	// Timeout threshold for the install to complete.
	useEffect( () => {
		if ( transferFailed ) {
			return;
		}

		const timeId = setTimeout( () => {
			setTransferFailed( true );
			onFailure( {
				type: 'transfer_timeout',
				error: 'transfer took too long.',
				code: 'transfer_timeout',
			} );
		}, 1000 * 180 );

		return () => {
			window?.clearTimeout( timeId );
		};
	}, [ onFailure, transferFailed ] );

	return (
		<>
			{ transferFailed && <Error /> }
			{ ! transferFailed && <Progress progress={ progress } /> }
		</>
	);
}
