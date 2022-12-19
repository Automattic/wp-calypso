import { useShoppingCart } from '@automattic/shopping-cart';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type EventData = {
	site_id: number | null;
	selected_product?: string;
	number_of_products?: number;
	[ key: string ]: string | number | null | undefined;
};

type EventDataOptions = {
	productSlug?: string;
	addProducts?: boolean;
};

export const useShoppingCartTracker = () => {
	const siteId = useSelector( getSelectedSiteId );
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const dispatch = useDispatch();

	return useCallback(
		( eventName: string, { productSlug, addProducts }: EventDataOptions ) => {
			// We do need this only for Jetpack cloud
			// If we want to use it everywhere we could move it as a parameter in event
			if ( ! isJetpackCloud() ) {
				return;
			}

			let eventData: EventData = {
				site_id: siteId,
			};

			if ( productSlug ) {
				eventData[ 'selected_product' ] = productSlug;
			}

			if ( addProducts ) {
				eventData = {
					...eventData,
					product_slugs_concatenated: responseCart.products.sort().join( '-' ),
					number_of_products: responseCart.products.length,
				};
			}

			dispatch( recordTracksEvent( eventName, eventData ) );
		},
		[ dispatch, siteId, responseCart ]
	);
};
