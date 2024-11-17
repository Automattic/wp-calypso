import { getEmptyResponseCart } from '../../src/empty-carts';
import type {
	RequestCart,
	ResponseCart,
	ResponseCartProduct,
	RequestCartProduct,
	CartKey,
} from '../../src/types';

export const mainCartKey = 1;

const emptyResponseCart = getEmptyResponseCart();

export const planOne: ResponseCartProduct = {
	bill_period: '365',
	time_added_to_cart: Date.now(),
	current_quantity: 1,
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1009,
	volume: 1,
	quantity: null,
	item_original_cost_integer: 14400,
	item_original_cost_for_quantity_one_integer: 14400,
	item_subtotal_integer: 14400,
	item_original_subtotal_integer: 14400,
	is_domain_registration: false,
	is_bundled: false,
	is_sale_coupon_applied: false,
	months_per_bill_period: null,
	uuid: 'product001',
	cost: 144,
	product_type: 'test',
	included_domain_purchase_amount: 0,
};

export const planTwo: ResponseCartProduct = {
	bill_period: '365',
	time_added_to_cart: Date.now(),
	current_quantity: 1,
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1010,
	volume: 1,
	quantity: null,
	item_original_cost_integer: 14400,
	item_original_cost_for_quantity_one_integer: 14400,
	item_subtotal_integer: 14400,
	item_original_subtotal_integer: 14400,
	is_domain_registration: false,
	is_bundled: false,
	is_sale_coupon_applied: false,
	months_per_bill_period: null,
	uuid: 'product002',
	cost: 144,
	product_type: 'test',
	included_domain_purchase_amount: 0,
};

export const renewalOne: ResponseCartProduct = {
	...planOne,
	extra: { purchaseType: 'renewal' },
};

export const renewalTwo: ResponseCartProduct = {
	...planTwo,
	extra: { purchaseType: 'renewal' },
};

export async function getCart( cartKey: CartKey ): Promise< ResponseCart > {
	if ( cartKey === mainCartKey ) {
		return {
			...emptyResponseCart,
			cart_key: cartKey,
		};
	}
	throw new Error( `Unknown cart key: ${ cartKey }` );
}

function createProduct( productProps: RequestCartProduct ): ResponseCartProduct {
	switch ( productProps.product_id ) {
		case planOne.product_id:
			return planOne;
		case planTwo.product_id:
			return planTwo;
	}
	throw new Error( 'Unknown product' );
}

export async function setCart( cartKey: CartKey, newCart: RequestCart ): Promise< ResponseCart > {
	if ( [ 'no-site', 'no-user', mainCartKey ].includes( cartKey ) ) {
		// Mock the shopping-cart endpoint response here
		return {
			...emptyResponseCart,
			cart_key: cartKey,
			products: newCart.products.map( createProduct ),
			coupon: newCart.coupon,
			is_coupon_applied: !! newCart.coupon,
			tax: {
				display_taxes: !! newCart.tax?.location.postal_code,
				location: newCart.tax?.location,
			},
		};
	}
	throw new Error( `Unknown cart key: ${ cartKey }` );
}
