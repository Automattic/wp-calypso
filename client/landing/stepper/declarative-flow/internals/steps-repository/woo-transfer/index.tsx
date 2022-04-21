/* eslint-disable no-console */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { transferStates } from 'calypso/state/atomic/transfers/constants';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const WooTransfer: Step = function WooTransfer( { navigation } ) {
	const { submit } = navigation;
	const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
	const {
		requestAtomicSoftwareStatus,
		requestLatestAtomicTransfer,
		initiateAtomicTransfer,
	} = useDispatch( SITE_STORE );
	const site = useSite();

	const siteId = site?.ID;

	const {
		getSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError,
		getAtomicSoftwareStatus,
		// getAtomicSoftwareError,
	} = useSelect( ( select ) => select( SITE_STORE ) );

	useEffect( () => {
		if ( ! siteId ) return;

		setPendingAction( async () => {
			const startTime = new Date().getTime();
			const totalTimeout = 1000 * 180;
			const maxFinishTime = startTime + totalTimeout;

			// Initiate transfer
			await initiateAtomicTransfer( siteId, 'woo-on-plans' );

			// Poll for transfer status
			let stopPollingTransfer = false;

			while ( ! stopPollingTransfer ) {
				await wait( 3000 );
				await requestLatestAtomicTransfer( siteId );
				const transfer = getSiteLatestAtomicTransfer( siteId );
				const transferError = getSiteLatestAtomicTransferError( siteId );
				const transferStatus = transfer?.status;
				const isTransferringStatusFailed = transferError && transferError?.status >= 500;

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
					throw new Error( 'Transfer error' );
					// onFailure( {
					// 	type: 'transfer',
					// 	error: transferError?.message || softwareError?.message || '',
					// 	code: transferError?.code || softwareError?.code || '',
					// } );
				}

				if ( maxFinishTime < new Date().getTime() ) {
					throw new Error( 'Timeout error' );
				}

				stopPollingTransfer = transferStatus === transferStates.COMPLETED;
			}

			// Poll for software status
			let stopPollingSoftware = false;

			while ( ! stopPollingSoftware ) {
				await wait( 3000 );
				await requestAtomicSoftwareStatus( siteId, 'woo-on-plans' );
				const softwareStatus = getAtomicSoftwareStatus( siteId, 'woo-on-plans' );
				// const softwareError = getAtomicSoftwareError( siteId, 'woo-on-plans' );
				// if ( softwareError ) {
				// 	throw new Error( 'Software error' );
				// }

				if ( maxFinishTime < new Date().getTime() ) {
					throw new Error( 'Timeout error' );
				}

				stopPollingSoftware = softwareStatus?.applied;
			}
			setProgress( 1 );
			// Allow progress bar to complete
			await wait( 500 );
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
};

export default WooTransfer;
