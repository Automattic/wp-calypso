import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getWooProductUrl } from '../lib/get-woo-product-url';

type Props = {
	productSlug: string;
};

export default function WooCustomFooter( { productSlug }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const url = getWooProductUrl( productSlug );

	const onViewWooPayments = useCallback( () => {
		dispatch(
			recordTracksEvent(
				'calypso_marketplace_products_overview_view_full_wooproduct_details_click',
				{
					product_slug: productSlug,
					url: url,
				}
			)
		);
	}, [ dispatch, productSlug, url ] );

	if ( ! url ) {
		return null;
	}

	return (
		<Button variant="secondary" href={ url } target="_blank" onClick={ onViewWooPayments }>
			{ translate( 'View all details on WooCommerce.com ↗' ) }
		</Button>
	);
}
