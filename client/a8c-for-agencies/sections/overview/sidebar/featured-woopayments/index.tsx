import { Badge, Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import WooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woopayments.svg';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

const DISMISSED_PREFERENCE = 'a4a_woopayments_featured_overview_card_dismissed';

export default function OverviewSidebarFeaturedWooPayments() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onDismiss = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_featured_woopayments_dismiss_click' ) );
		dispatch( savePreference( DISMISSED_PREFERENCE, true ) );
	}, [ dispatch ] );

	const isDismissed = useSelector( ( state ) => getPreference( state, DISMISSED_PREFERENCE ) );

	if ( isDismissed ) {
		return null;
	}

	return (
		<Card className="overview__featured-woopayments">
			<Button
				className="overview__featured-dismiss-button"
				variant="tertiary"
				icon={ close }
				onClick={ onDismiss }
			/>

			<Badge className="overview__featured-woopayments-badge">{ translate( 'Featured' ) }</Badge>

			<img
				className="overview__featured-woopayments-logo"
				src={ WooPaymentsLogo }
				alt="WooPayments"
			/>

			<div className="overview__featured-woopayments-content">
				<h3 className="overview__featured-woopayments-title">
					{ translate( 'Revenue share available' ) }
				</h3>

				<div className="overview__featured-woopayments-description">
					{ translate(
						"Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients' sites within Automattic for Agencies."
					) }
				</div>
			</div>

			<Button
				className="overview__featured-woopayments-button"
				variant="primary"
				__next40pxDefaultSize
			>
				{ translate( 'View details and start earning' ) }
			</Button>
		</Card>
	);
}
