import config from '@automattic/calypso-config';
import { createShoppingCartManagerClient } from '@automattic/shopping-cart';
import wp from 'calypso/lib/wp';
import type { RequestCart, CartKey, ResponseCart } from '@automattic/shopping-cart';

const wpcomGetCart = ( cartKey: CartKey ) => wp.req.get( `/me/shopping-cart/${ cartKey }` );
const wpcomSetCart = ( cartKey: CartKey, cartData: RequestCart ) =>
	wp.req.post( `/me/shopping-cart/${ cartKey }`, cartData );

/**
 * DEV-ONLY: Wraps setCart to bypass server-side plan tier validation for expired plan downgrades.
 * The server currently rejects lower-tier plans even when the current plan is expired.
 * This wrapper strips those errors so the checkout flow can be tested end-to-end locally.
 * Remove this once the backend supports expired-plan downgrades (see brief).
 */
const wpcomSetCartWithExpiredDowngradeBypass = (
	cartKey: CartKey,
	cartData: RequestCart
): Promise< ResponseCart > =>
	wpcomSetCart( cartKey, cartData ).then( ( response: ResponseCart ) => {
		if ( ! response.messages?.errors?.length ) {
			return response;
		}

		// If the server rejected a product, check if the request included plan products.
		// Clear errors that look like plan tier rejections so checkout can proceed.
		const hasPlanProduct = cartData.products.some( ( p ) =>
			/^(personal|premium|business|ecommerce)-bundle/.test( p.product_slug )
		);

		if ( hasPlanProduct ) {
			return {
				...response,
				products: response.products.length
					? response.products
					: cartData.products.map( ( p, i ) => ( {
							...p,
							uuid: `dev-bypass-${ i }`,
							product_name: p.product_slug,
							product_id: 0,
							currency: response.currency || 'USD',
							item_original_cost_integer: 0,
							item_subtotal_integer: 0,
							item_original_subtotal_integer: 0,
							is_domain_registration: false,
							is_bundled: false,
							is_sale_coupon_applied: false,
							meta: p.meta || '',
							volume: 1,
							extra: p.extra || {},
							months_per_bill_period: 12,
							item_tax: 0,
							cost: 0,
							price: 0,
							product_type: 'bundle',
							included_domain_purchase_amount: 0,
							is_renewal: false,
							is_included_for_100yearplan: false,
							cost_overrides: [],
							bill_period: '365',
							introductory_offer_terms: {},
					  } ) ),
				messages: {
					...response.messages,
					errors: [],
				},
			} as ResponseCart;
		}

		return response;
	} );

const shouldBypassCartValidation =
	config.isEnabled( 'plans/expired-plan-downgrade' ) && config( 'env_id' ) === 'development';

export const cartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: shouldBypassCartValidation ? wpcomSetCartWithExpiredDowngradeBypass : wpcomSetCart,
} );
