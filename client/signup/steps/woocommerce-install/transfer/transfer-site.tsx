import { useI18n } from '@wordpress/react-i18n';
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

export default function TransferSite(): ReactElement | null {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const [ progress, setProgress ] = useState( 0.1 );

	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const transfer = useSelector( ( state ) => getLatestAtomicTransfer( state, siteId ) );
	const transferStatus = transfer?.status;
	const transferFailed = !! transfer?.error;
	const softwareStatus = useSelector( ( state ) =>
		getAtomicSoftwareStatus( state, siteId, 'woo-on-plans' )
	);
	const wcAdmin = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	// Initiate Atomic transfer
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
		transferStatus === transferStates.COMPLETED || transferFailed ? null : 3000
	);

	// Poll for software status
	useInterval(
		() => {
			dispatch( requestAtomicSoftwareStatus( siteId, 'woo-on-plans' ) );
		},
		softwareStatus?.applied ? null : 3000
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
				setProgress( 0.6 );
				break;
			case transferStates.COMPLETED:
				if ( softwareStatus?.applied ) {
					setProgress( 1 );
					window.location.href = wcAdmin;
				}
				setProgress( 0.9 );
				break;
		}

		if ( transferFailed || transferStatus === transferStates.ERROR ) {
			setProgress( 1 );
		}
	}, [ siteId, transferStatus, transferFailed, softwareStatus, wcAdmin, __ ] );

	// todo: transferFailed states need testing and if required, pass the message through correctly
	return (
		<>
			{ transferFailed && <Error message={ transferStatus || '' } /> }
			{ ! transferFailed && <Progress progress={ progress } /> }
		</>
	);
}
