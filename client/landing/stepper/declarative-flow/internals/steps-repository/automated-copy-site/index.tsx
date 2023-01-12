import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';

const TIME_CHECK_TRANSFER_STATUS = 3000;

export const transferStates = {
	PENDING: 'pending',
	ACTIVE: 'active',
	PROVISIONED: 'provisioned',
	COMPLETED: 'completed',
	ERROR: 'error',
	REVERTED: 'reverted',
	RELOCATING_REVERT: 'relocating_revert',
	RELOCATING_SWITCHEROO: 'relocating_switcheroo',
	REVERTING: 'reverting',
	RENAMING: 'renaming',
	EXPORTING: 'exporting',
	IMPORTING: 'importing',
	CLEANUP: 'cleanup',
} as const;

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const AutomatedCopySite: Step = function AutomatedCopySite( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();
	const urlQueryParams = useQuery();
	const siteSlug = urlQueryParams.get( 'siteSlug' );
	const sourceSlug = urlQueryParams.get( 'sourceSlug' );
	const sourceSite = useSelect(
		( select ) => sourceSlug && select( SITE_STORE ).getSite( sourceSlug )
	);
	const sourceSiteId = sourceSite?.ID;
	const { setPendingAction, setProgress, setProgressTitle } = useDispatch( ONBOARD_STORE );
	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );
	const { getSiteLatestAtomicTransfer, getSiteLatestAtomicTransferError } = useSelect( ( select ) =>
		select( SITE_STORE )
	);

	const progressTitle = __( 'Copying site' );

	useEffect( () => {
		if ( ! site?.ID || ! sourceSiteId ) {
			return;
		}
		setProgressTitle( progressTitle );
		setPendingAction( async () => {
			const siteId = site.ID;
			setProgress( 0 );
			try {
				await wpcom.req.post( {
					path: `/sites/${ siteId }/copy-from-site`,
					apiNamespace: 'wpcom/v2',
					body: {
						source_blog_id: sourceSiteId,
					},
				} );
			} catch ( _error ) {
				throw new Error( 'Error copying site' );
			}

			let stopPollingTransfer = false;

			while ( ! stopPollingTransfer ) {
				await wait( TIME_CHECK_TRANSFER_STATUS );
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
					throw new Error( 'Error copying site' );
				}

				stopPollingTransfer = transferStatus === transferStates.COMPLETED;
			}

			setProgress( 1 );

			return { finishedWaitingForCopy: true, siteSlug };
		} );

		submit?.();
	}, [
		progressTitle,
		sourceSiteId,
		siteSlug,
		setProgressTitle,
		getSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError,
		requestLatestAtomicTransfer,
		setPendingAction,
		setProgress,
		site,
		submit,
	] );

	return null;
};

export default AutomatedCopySite;
