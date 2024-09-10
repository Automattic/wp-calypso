import { hasQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { infoNotice, successNotice } from 'calypso/state/notices/actions';
import { StepProps } from '../types';
import ConnectStripe from './paid-subscribers/connect-stripe';
import MapPlans from './paid-subscribers/map-plans';

export default function PaidSubscribers( {
	nextStepUrl,
	selectedSite,
	fromSite,
	isFetchingContent,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
	status,
}: StepProps ) {
	const dispatch = useDispatch();
	const isCancelled = hasQueryArg( window.location.href, 'stripe_connect_cancelled' );
	const isSuccess = hasQueryArg( window.location.href, 'stripe_connect_success' );
	const hasConnectedAccount = cardData.is_connected_stripe;

	useEffect( () => {
		if ( isSuccess ) {
			dispatch( successNotice( 'Stripe account connected successfully' ) );
		} else if ( isCancelled ) {
			dispatch( infoNotice( 'Stripe account connection cancelled' ) );
		}
	}, [ isSuccess, dispatch, isCancelled ] );

	return (
		<>
			{ ! hasConnectedAccount && (
				<ConnectStripe
					status={ status }
					cardData={ cardData }
					engine={ engine }
					fromSite={ fromSite }
					isFetchingContent={ isFetchingContent }
					nextStepUrl={ nextStepUrl }
					selectedSite={ selectedSite }
					setAutoFetchData={ setAutoFetchData }
					siteSlug={ siteSlug }
					skipNextStep={ skipNextStep }
				/>
			) }
			{ hasConnectedAccount && (
				<MapPlans
					status={ status }
					cardData={ cardData }
					engine={ engine }
					fromSite={ fromSite }
					isFetchingContent={ isFetchingContent }
					nextStepUrl={ nextStepUrl }
					selectedSite={ selectedSite }
					setAutoFetchData={ setAutoFetchData }
					siteSlug={ siteSlug }
					skipNextStep={ skipNextStep }
				/>
			) }
		</>
	);
}
