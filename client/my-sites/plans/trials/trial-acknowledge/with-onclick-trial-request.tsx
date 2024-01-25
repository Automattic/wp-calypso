import { createHigherOrderComponent } from '@wordpress/compose';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { useDispatch, useSelector } from 'calypso/state';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { fetchJITM } from 'calypso/state/jitm/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const WithOnclickTrialRequest = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const dispatch = useDispatch();
		const siteId = useSelector( getSelectedSiteId ) as number;
		const locale = useSelector( getCurrentUserLocale );
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
