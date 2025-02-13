import { Button } from '@wordpress/components';
import { external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function WooPaymentsCustomFooter() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onViewWooPayments = useCallback( () => {
		dispatch(
			recordTracksEvent(
				'calypso_marketplace_products_overview_view_full_woopayments_details_click'
			)
		);
	}, [ dispatch ] );

	return (
		<Button
			variant="secondary"
			href="https://woocommerce.com/es/products/woopayments/"
			target="_blank"
			icon={ external }
			iconPosition="right"
			onCanPlay={ onViewWooPayments }
		>
			{ translate( 'View all details on WooCommerce.com' ) }
		</Button>
	);
}
