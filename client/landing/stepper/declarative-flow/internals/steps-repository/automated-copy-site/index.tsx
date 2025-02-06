import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';
import type { SiteSelect } from '@automattic/data-stores';

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

	useEffect( () => {
		if ( ! site?.ID || ! sourceSiteId ) {
			return;
		}
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
				throw new Error( 'Error copying site' );
			}
		}
		initCopySite();
		setPendingAction( async () => {
			setProgress( 0 );
			let stopPollingTransfer = false;

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
					throw new Error( 'Error copying site' );
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
		siteSlug,
		sourceSiteId,
		submit,
	] );

	return null;
};

export default AutomatedCopySite;
