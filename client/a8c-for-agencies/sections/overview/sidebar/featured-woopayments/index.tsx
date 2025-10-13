import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import WooPaymentsFeaturedCard from './featured-card';
import useWooPaymentsProduct from './hooks/use-get-woopayments-product';

import './style.scss';

const DISMISSED_PREFERENCE = 'a4a_woopayments_featured_overview_card_dismissed';

export default function OverviewSidebarFeaturedWooPayments() {
	const dispatch = useDispatch();

	const product = useWooPaymentsProduct();

	const onDismiss = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_featured_woopayments_dismiss_click' ) );
		dispatch( savePreference( DISMISSED_PREFERENCE, true ) );
	}, [ dispatch ] );

	const onClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_featured_woopayments_cta_click' ) );
	}, [ dispatch ] );

	const isDismissed = useSelector( ( state ) => getPreference( state, DISMISSED_PREFERENCE ) );

	if ( isDismissed || ! product ) {
		return null;
	}

	return <WooPaymentsFeaturedCard onDismiss={ onDismiss } onClick={ onClick } />;
}
