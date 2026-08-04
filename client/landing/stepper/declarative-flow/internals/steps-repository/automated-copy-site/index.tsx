import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	createRevertedTransferWatcher,
	getTransferFailureMessage,
	transferStates,
} from 'calypso/landing/stepper/utils/atomic-transfer-outcome';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';
import type { SiteSelect } from '@automattic/data-stores';

const TIME_CHECK_TRANSFER_STATUS = 3000;
const TRANSFER_TIMEOUT = 1000 * 300;

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const AutomatedCopySite: Step = function AutomatedCopySite( { navigation } ) {
	const { submit } = navigation;
	const site = useSite();
	const urlQueryParams = useQuery();
	const siteSlug = urlQueryParams.get( 'siteSlug' );
	const sourceSlug = urlQueryParams.get( 'sourceSlug' );
	const sourceSite = useSelect(
		( select ) =>
			sourceSlug ? ( select( SITE_STORE ) as SiteSelect ).getSite( sourceSlug ) : undefined,
		[ sourceSlug ]
	);
	const sourceSiteId = sourceSite?.ID;
	const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );
	const { getSiteLatestAtomicTransfer, getSiteLatestAtomicTransferError } = useSelect(
		( select ) => select( SITE_STORE ) as SiteSelect,
		[]
	);
	const instanceRef = useRef< { siteId?: number; sourceSiteId?: number } >( {} );

	useEffect( () => {
		if ( ! site?.ID || ! sourceSiteId ) {
			return;
		}
		if (
			instanceRef.current.siteId === site.ID &&
			instanceRef.current.sourceSiteId === sourceSiteId
		) {
			return;
		}
		instanceRef.current = { siteId: site.ID, sourceSiteId };

		async function initCopySite() {
			try {
				await wpcom.req.post( {
					path: `/sites/${ site?.ID }/copy-from-site`,
					apiNamespace: 'wpcom/v2',
					body: {
						source_blog_id: sourceSiteId,
					},
				} );
			} catch ( _error ) {
				throw new Error( __( 'Error copying site' ) );
			}
		}
		initCopySite();
		setPendingAction( async () => {
			setProgress( 0 );
			let stopPollingTransfer = false;
			const maxFinishTime = new Date().getTime() + TRANSFER_TIMEOUT;
			const isRevertOfThisTransfer = createRevertedTransferWatcher();

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
				await requestLatestAtomicTransfer( site.ID );
				const transfer = getSiteLatestAtomicTransfer( site.ID );
				const transferError = getSiteLatestAtomicTransferError( site.ID );
				const transferStatus = transfer?.status;
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

				if ( isRevertOfThisTransfer( transfer ) ) {
					recordTransferFailure( {
						type: 'transfer_reverted',
						error: `transfer reverted (status: ${ transferStatus })`,
						code: 'transfer_reverted',
					} );
					throw new Error( getTransferFailureMessage( 'reverted' ) );
				}

				if ( maxFinishTime < new Date().getTime() ) {
					recordTransferFailure( {
						type: 'transfer_timeout',
						error: 'transfer took too long',
						code: 'transfer_timeout',
					} );
					throw new Error( getTransferFailureMessage( 'timeout' ) );
				}

				stopPollingTransfer = transferStatus === transferStates.COMPLETED;
			}

			setProgress( 100 );

			return { finishedWaitingForCopy: true, siteSlug };
		} );

		submit?.();
	}, [
		getSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError,
		requestLatestAtomicTransfer,
		setPendingAction,
		setProgress,
		site?.ID,
		site?.URL,
		siteSlug,
		sourceSiteId,
		submit,
	] );

	return null;
};

export default AutomatedCopySite;
