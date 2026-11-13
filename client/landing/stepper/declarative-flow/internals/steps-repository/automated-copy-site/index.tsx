import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	getTransferFailureMessage,
	isRevertedTransferStatus,
	transferStates,
} from 'calypso/landing/stepper/utils/atomic-transfer-outcome';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';

const TIME_CHECK_TRANSFER_STATUS = 3000;
const TRANSFER_TIMEOUT = 1000 * 300;

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

interface CopySiteInitialization {
	status: 'not_started' | 'initializing' | 'started' | 'failed';
	transfer_id: number | null;
	error_code: string | null;
}

const AutomatedCopySite: Step = function AutomatedCopySite( { navigation } ) {
	const { submit, exitFlow } = navigation;
	const { data: site, isError: isDestinationError } = useSiteQuery();
	const urlQueryParams = useQuery();
	const siteSlug = urlQueryParams.get( 'siteSlug' );
	const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );
	const { getSiteLatestAtomicTransfer, getSiteLatestAtomicTransferError } = useSelect(
		( select ) => select( SITE_STORE ),
		[]
	);
	const instanceRef = useRef< number | null >( null );

	useEffect( () => {
		if ( isDestinationError ) {
			exitFlow?.( '/sites' );
			return;
		}
		if ( ! site?.ID ) {
			return;
		}
		if ( instanceRef.current === site.ID ) {
			return;
		}
		instanceRef.current = site.ID;
		setPendingAction( async () => {
			setProgress( 0 );
			let stopPollingTransfer = false;
			let transferId: number | null = null;
			const maxFinishTime = new Date().getTime() + TRANSFER_TIMEOUT;

			const recordTransferFailure = ( failureInfo: {
				type: string;
				error: string;
				code: string;
			} ) => {
				recordTracksEvent( 'calypso_copy_site_transfer_failure', {
					type: failureInfo.type,
					error: failureInfo.error,
					code: failureInfo.code,
					site: site.URL,
				} );
			};

			while ( ! stopPollingTransfer ) {
				await wait( TIME_CHECK_TRANSFER_STATUS );
				if ( maxFinishTime < new Date().getTime() ) {
					recordTransferFailure( {
						type: 'transfer_timeout',
						error: 'transfer took too long',
						code: 'transfer_timeout',
					} );
					throw new Error( getTransferFailureMessage( 'timeout' ) );
				}

				if ( ! transferId ) {
					const initialization: CopySiteInitialization = await wpcom.req
						.get( {
							path: `/sites/${ site.ID }/copy-from-site`,
							apiNamespace: 'wpcom/v2',
						} )
						.catch( () => {
							throw new Error( __( 'Error copying site' ) );
						} );
					if ( initialization.status === 'failed' ) {
						recordTransferFailure( {
							type: 'initialization_error',
							error: 'Site copy initialization failed',
							code: initialization.error_code || '',
						} );
						throw new Error( __( 'Error copying site' ) );
					}
					if ( initialization.status !== 'started' || ! initialization.transfer_id ) {
						continue;
					}
					transferId = initialization.transfer_id;
				}

				await requestLatestAtomicTransfer( site.ID );
				const transfer = getSiteLatestAtomicTransfer( site.ID );
				const transferError = getSiteLatestAtomicTransferError( site.ID );
				const transferStatus =
					Number( transfer?.atomic_transfer_id ) === transferId ? transfer?.status : undefined;
				const isTransferringStatusFailed = transferError && transferError?.status >= 500;

				switch ( transferStatus ) {
					case transferStates.PENDING:
						setProgress( 20 );
						break;
					case transferStates.ACTIVE:
						setProgress( 40 );
						break;
					case transferStates.PROVISIONED:
						setProgress( 50 );
						break;
					case transferStates.COMPLETED:
						setProgress( 70 );
						break;
				}

				if ( isTransferringStatusFailed || transferStatus === transferStates.ERROR ) {
					recordTransferFailure( {
						type: 'transfer_error',
						error: transferError?.message || '',
						code: String( transferError?.code || '' ),
					} );
					throw new Error( getTransferFailureMessage( 'error' ) );
				}

				if ( isRevertedTransferStatus( transferStatus ) ) {
					recordTransferFailure( {
						type: 'transfer_reverted',
						error: `transfer reverted (status: ${ transferStatus })`,
						code: 'transfer_reverted',
					} );
					throw new Error( getTransferFailureMessage( 'reverted' ) );
				}

				stopPollingTransfer = transferStatus === transferStates.COMPLETED;
			}

			setProgress( 100 );

			return { finishedWaitingForCopy: true, siteSlug };
		} );

		submit?.();
	}, [
		exitFlow,
		getSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError,
		isDestinationError,
		requestLatestAtomicTransfer,
		setPendingAction,
		setProgress,
		site?.ID,
		site?.URL,
		siteSlug,
		submit,
	] );

	return null;
};

export default AutomatedCopySite;
