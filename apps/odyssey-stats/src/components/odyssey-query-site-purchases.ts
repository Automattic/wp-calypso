/**
 * This is a Odyssey implementation of 'calypso/components/data/query-site-purchases'.
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'calypso/state';
import { PURCHASES_SITE_FETCH_COMPLETED } from 'calypso/state/action-types';
import { getSiteProducts } from 'calypso/state/sites/selectors';

export default function OdysseyQuerySitePurchases( { siteId }: { siteId: number | null } ) {
	const reduxDispatch = useDispatch();
	const purchasedProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );

	useEffect( () => {
		reduxDispatch( {
			type: PURCHASES_SITE_FETCH_COMPLETED,
			siteId,
			purchases:
				purchasedProducts?.map( ( product, index ) => ( {
					ID: index,
					product_id: product.productId,
					product_slug: product.productSlug,
					product_name: product.productName,
					expired: product.expired,
					expiry_status: product.expired ? 'expired' : 'active',
					active: ! product.expired,
					blog_id: siteId,
					product_type: 'jetpack',
				} ) ) ?? [],
		} );
	}, [ reduxDispatch, siteId ] );

	return null;
}
