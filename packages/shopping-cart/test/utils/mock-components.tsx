import { useEffect, PropsWithChildren } from 'react';
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
	CartKey,
} from '../../src/types';

export function ProductList( { initialProducts }: { initialProducts?: RequestCartProduct[] } ) {
	const { isPendingUpdate, responseCart, addProductsToCart } = useShoppingCart( undefined );
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
}: { productsToAddOnClick: RequestCartProduct[] } & WithShoppingCartProps ) {
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
}: PropsWithChildren< {
	setCartOverride?: SetCart;
	getCartOverride?: GetCart;
	options?: ShoppingCartManagerOptions;
	cartKeyOverride?: CartKey;
	useUndefinedCartKey?: boolean;
} > ) {
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
