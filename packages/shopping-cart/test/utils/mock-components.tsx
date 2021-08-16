import React, { useEffect, useRef } from 'react';
import { useShoppingCart, ShoppingCartProvider } from '../../src/index';
import { getCart, setCart, mainCartKey } from './mock-cart-api';
import type {
	RequestCartProduct,
	MinimalRequestCartProduct,
	GetCart,
	SetCart,
	WithShoppingCartProps,
	ShoppingCartManagerOptions,
} from '../../src/types';

export function ProductList( {
	initialProducts,
	initialProductsForReplace,
	initialCoupon,
}: {
	initialProducts?: MinimalRequestCartProduct[];
	initialProductsForReplace?: MinimalRequestCartProduct[];
	initialCoupon?: string;
} ): JSX.Element {
	const {
		isPendingUpdate,
		responseCart,
		addProductsToCart,
		replaceProductsInCart,
		applyCoupon,
	} = useShoppingCart();
	const hasAddedProduct = useRef( false );
	useEffect( () => {
		if ( initialProducts && ! hasAddedProduct.current ) {
			hasAddedProduct.current = true;
			addProductsToCart( initialProducts );
		}
	}, [ addProductsToCart, initialProducts ] );
	useEffect( () => {
		if ( initialProductsForReplace && ! hasAddedProduct.current ) {
			hasAddedProduct.current = true;
			replaceProductsInCart( initialProductsForReplace );
		}
	}, [ replaceProductsInCart, initialProductsForReplace ] );
	const hasAddedCoupon = useRef( false );
	useEffect( () => {
		if ( initialCoupon && ! hasAddedCoupon.current ) {
			hasAddedCoupon.current = true;
			applyCoupon( initialCoupon );
		}
	}, [ applyCoupon, initialCoupon ] );
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
}: {
	children: React.ReactNode;
	setCartOverride?: SetCart;
	getCartOverride?: GetCart;
	options?: ShoppingCartManagerOptions;
	cartKeyOverride?: string | undefined;
} ): JSX.Element {
	return (
		<ShoppingCartProvider
			setCart={ setCartOverride ?? setCart }
			getCart={ getCartOverride ?? getCart }
			cartKey={ cartKeyOverride ?? mainCartKey }
			options={ {
				...( options ?? {} ),
			} }
		>
			{ children }
		</ShoppingCartProvider>
	);
}
