import { useI18n } from '@wordpress/react-i18n';
import { hasQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { infoNotice, successNotice } from 'calypso/state/notices/actions';
import { SubscribersStepProps } from '../types';
import ConnectStripe from './paid-subscribers/connect-stripe';
import MapPlans from './paid-subscribers/map-plans';

interface PaidSubscribersProps extends SubscribersStepProps {
	onStartImport: () => void;
}

export default function PaidSubscribers( {
	selectedSite,
	fromSite,
	siteSlug,
	skipNextStep,
	cardData,
	engine,
	setAutoFetchData,
	status,
	onStartImport,
}: PaidSubscribersProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const isCancelled = hasQueryArg( window.location.href, 'stripe_connect_cancelled' );
	const isSuccess = hasQueryArg( window.location.href, 'stripe_connect_success' );
	const hasConnectedAccount = cardData.is_connected_stripe;

	useEffect( () => {
		if ( isSuccess ) {
			dispatch( successNotice( __( 'Stripe account connected successfully' ) ) );
		} else if ( isCancelled ) {
			dispatch( infoNotice( __( 'Stripe account connection cancelled' ) ) );
		}
	}, [ isSuccess, dispatch, isCancelled, __ ] );

	return (
		<>
			{ ! hasConnectedAccount && (
				<ConnectStripe
					status={ status }
					cardData={ cardData }
					engine={ engine }
					fromSite={ fromSite }
					selectedSite={ selectedSite }
					setAutoFetchData={ setAutoFetchData }
					siteSlug={ siteSlug }
					onStartImport={ onStartImport }
					skipNextStep={ skipNextStep }
				/>
			) }
			{ hasConnectedAccount && (
				<MapPlans
					status={ status }
					cardData={ cardData }
					engine={ engine }
					selectedSite={ selectedSite }
					setAutoFetchData={ setAutoFetchData }
					siteSlug={ siteSlug }
					onStartImport={ onStartImport }
					skipNextStep={ skipNextStep }
				/>
			) }
		</>
	);
}
