import { ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { useCallback } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch, useSelector } from 'calypso/state';
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
	quantity?: number | null;
};

// Record tracks are not allowing objects inside track events
// so this little hack to provide array reduced into object so it can be spread in the event
const reduceProducts = ( products: ResponseCartProduct[] ) =>
	products.reduce( ( res, item ) => {
		res[ `cart_has_product_slug_${ item.product_slug }` ] = true;
		return res;
	}, {} as any ); //eslint-disable-line @typescript-eslint/no-explicit-any

export const useShoppingCartTracker = () => {
	const siteId = useSelector( getSelectedSiteId );
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const dispatch = useDispatch();

	return useCallback(
		( eventName: string, { productSlug, addProducts, quantity }: EventDataOptions ) => {
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

			if ( quantity ) {
				eventData[ 'quantity' ] = quantity;
			}

			if ( addProducts ) {
				eventData = {
					...eventData,
					...reduceProducts( responseCart.products ),
					product_slugs_concatenated: responseCart.products
						.map( ( product ) => product.product_slug )
						.sort()
						.join( ',' ),
					number_of_products: responseCart.products.length,
				};
			}

			dispatch( recordTracksEvent( eventName, eventData ) );
		},
		[ dispatch, siteId, responseCart ]
	);
};
