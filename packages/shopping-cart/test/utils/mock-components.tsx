import { useEffect } from 'react';
import * as React from 'react';
import {
	useShoppingCart,
	ShoppingCartProvider,
	createShoppingCartManagerClient,
} from '../../src/index';
import { getCart, setCart, mainCartKey } from './mock-cart-api';
import type {
	RequestCartProduct,
	GetCart,
	SetCart,
	WithShoppingCartProps,
	ShoppingCartManagerOptions,
} from '../../src/types';

export function ProductList( {
	initialProducts,
}: {
	initialProducts?: RequestCartProduct[];
} ): JSX.Element {
	const { isPendingUpdate, responseCart, addProductsToCart } = useShoppingCart();
	useEffect( () => {
		initialProducts && addProductsToCart( initialProducts );
	}, [ addProductsToCart, initialProducts ] );
	if ( responseCart.products.length === 0 ) {
		return <div>No products</div>;
	}
	const coupon = responseCart.is_coupon_applied ? <div>Coupon: { responseCart.coupon }</div> : null;
	const location = responseCart.tax.location.postal_code ? (
		<div>
			Location: { responseCart.tax.location.postal_code },{ ' ' }
			{ responseCart.tax.location.country_code }, { responseCart.tax.location.subdivision_code }
		</div>
	) : null;
	return (
		<ul data-testid="product-list">
			{ isPendingUpdate && <div>Loading...</div> }
			{ coupon }
			{ location }
			{ responseCart.products.map( ( product ) => {
				return (
					<li key={ product.uuid }>
						<span>{ product.product_slug }</span>
						<span>{ product.product_name }</span>
					</li>
				);
			} ) }
		</ul>
	);
}

export function ProductListWithoutHook( {
	shoppingCartManager,
	cart,
	productsToAddOnClick,
}: { productsToAddOnClick: RequestCartProduct[] } & WithShoppingCartProps ): JSX.Element {
	const { isPendingUpdate, addProductsToCart } = shoppingCartManager;
	const onClick = () => {
		addProductsToCart( productsToAddOnClick );
	};
	return (
		<ul data-testid="product-list">
			{ isPendingUpdate && <div>Loading...</div> }
			{ cart.products.map( ( product ) => {
				return (
					<li key={ product.uuid }>
						<span>{ product.product_slug }</span>
						<span>{ product.product_name }</span>
					</li>
				);
			} ) }
			<button onClick={ onClick }>Click me</button>
		</ul>
	);
}

export function MockProvider( {
	children,
	setCartOverride,
	getCartOverride,
	options,
	cartKeyOverride,
	useUndefinedCartKey,
}: {
	children: React.ReactNode;
	setCartOverride?: SetCart;
	getCartOverride?: GetCart;
	options?: ShoppingCartManagerOptions;
	cartKeyOverride?: string | undefined;
	useUndefinedCartKey?: boolean;
} ): JSX.Element {
	const managerClient = createShoppingCartManagerClient( {
		getCart: getCartOverride ?? getCart,
		setCart: setCartOverride ?? setCart,
	} );
	const defaultCartKey = ( () => {
		if ( useUndefinedCartKey ) {
			return undefined;
		}
		return cartKeyOverride ?? mainCartKey;
	} )();
	return (
		<ShoppingCartProvider
			options={ {
				...( options ?? {} ),
				defaultCartKey,
			} }
			managerClient={ managerClient }
		>
			{ children }
		</ShoppingCartProvider>
	);
}
