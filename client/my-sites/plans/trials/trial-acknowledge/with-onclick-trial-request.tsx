import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from 'react';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { useDispatch, useSelector } from 'calypso/state';
import {
	fetchAutomatedTransferStatus,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import { transferInProgress, transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { fetchJITM } from 'calypso/state/jitm/actions';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const WithOnclickTrialRequest = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const dispatch = useDispatch();
		const siteId = useSelector( getSelectedSiteId ) as number;
		const locale = useSelector( getCurrentUserLocale );
		const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
		const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId as number ) );
		const isFetchingTransferStatus = useSelector( ( state ) =>
			isFetchingAutomatedTransferStatus( state, siteId )
		);

		useEffect( () => {
			if ( siteId && isSiteAtomic ) {
				return;
			}
			if (
				! isFetchingTransferStatus &&
				transferInProgress.includes( transferStatus as ( typeof transferInProgress )[ number ] )
			) {
				waitFor( 2 ).then( () => dispatch( fetchAutomatedTransferStatus( siteId ) ) );
			}
			// Once the transferStatus is reported complete, query the sites endpoint
			// until the `is_wpcom_atomic` = true is returned
			if ( transferStatus === transferStates.COMPLETED && ! isSiteAtomic ) {
				waitFor( 2 ).then( () => dispatch( requestSite( siteId ) ) );
			}
		}, [ transferStatus ] );

		const fetchUpdatedData = () => {
			//after transfer is complete we wait to fetch update site with `is_wpcom_atomic`
			waitFor( 2 ).then( () => dispatch( requestSite( siteId ) ) );
			dispatch( fetchSitePlans( siteId ) );
			dispatch( fetchSiteFeatures( siteId ) );
			dispatch( requestEligibility( siteId ) );
			dispatch( fetchJITM( siteId, 'calypso:sites:sidebar_notice', null, locale ) );
		};
		return <Wrapped { ...props } fetchUpdatedData={ fetchUpdatedData } />;
	},
	'WithOnclickTrialRequest'
);
