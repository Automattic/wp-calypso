import { hasQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { useSelector, useDispatch } from 'calypso/state';
import { getIsConnectedForSiteId } from 'calypso/state/memberships/settings/selectors';
import { infoNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectStripe from './connect-stripe';
import MapPlans from './map-plans';
type Props = {
	nextStepUrl: string;
	fromSite: string;
};

export default function PaidSubscribers( { nextStepUrl, fromSite }: Props ) {
	const site = useSelector( getSelectedSite );
	const dispatch = useDispatch();

	const hasConnectedAccount = useSelector( ( state ) =>
		getIsConnectedForSiteId( state, site?.ID )
	);

	const isCancelled = hasQueryArg( window.location.href, 'stripe_connect_cancelled' );
	const isSuccess = hasQueryArg( window.location.href, 'stripe_connect_success' );

	useEffect( () => {
		if ( isSuccess ) {
			dispatch( successNotice( 'Stripe account connected successfully' ) );
		} else if ( isCancelled ) {
			dispatch( infoNotice( 'Stripe account connection cancelled' ) );
		}
	}, [ isSuccess, dispatch, isCancelled ] );

	return (
		<>
			{ site?.ID && (
				<QueryMembershipsSettings siteId={ site.ID } source="import-paid-subscribers" />
			) }

			{ ! hasConnectedAccount && (
				<ConnectStripe nextStepUrl={ nextStepUrl } fromSite={ fromSite } />
			) }
			{ hasConnectedAccount && <MapPlans nextStepUrl={ nextStepUrl } fromSite={ fromSite } /> }
		</>
	);
}
