import { hasQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { infoNotice, successNotice } from 'calypso/state/notices/actions';
import ConnectStripe from './connect-stripe';
import MapPlans from './map-plans';
type Props = {
	nextStepUrl: string;
	skipNextStep: () => void;
	fromSite: string;
	engine: string;
	cardData: any;
	isFetchingContent: boolean;
};

export default function PaidSubscribers( {
	nextStepUrl,
	fromSite,
	engine,
	skipNextStep,
	cardData,
	isFetchingContent,
}: Props ) {
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
					nextStepUrl={ nextStepUrl }
					skipNextStep={ skipNextStep }
					cardData={ cardData }
					fromSite={ fromSite }
					engine={ engine }
					isFetchingContent={ isFetchingContent }
				/>
			) }
			{ hasConnectedAccount && (
				<MapPlans nextStepUrl={ nextStepUrl } cardData={ cardData } skipNextStep={ skipNextStep } />
			) }
		</>
	);
}
