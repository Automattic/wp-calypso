import { ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useRestorableProducts } from 'calypso/my-sites/checkout/src/components/restorable-products-context';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import './style.scss';

export const RemovedFromCartItem = ( { product }: { product: ResponseCartProduct } ) => {
	const cartKey = useCartKey();
	const [ restorableProducts, setRestorableProducts ] = useRestorableProducts();
	const { addProductsToCart } = useShoppingCart( cartKey );
	const [ disabled, setDisabled ] = useState( false );
	const translate = useTranslate();

	return (
		<li key={ product.uuid } className="removed-from-cart-item">
			{ translate( '%(product)s was removed from the shopping cart.', {
				args: { product: product.product_name },
			} ) }
			<Button
				className="restorable-product-button"
				disabled={ disabled }
				onClick={ async () => {
					setDisabled( true );

					await addProductsToCart( [ product ] );

					setRestorableProducts( restorableProducts.filter( ( p ) => p.uuid !== product.uuid ) );
				} }
			>
				{ translate( 'Restore' ) }
			</Button>
		</li>
	);
};

export const RemovedFromCartItems = () => {
	const [ restorableProducts ] = useRestorableProducts();

	if ( ! restorableProducts || restorableProducts.length === 0 ) {
		return null;
	}

	return (
		<ul className="removed-from-cart-items">
			{ restorableProducts.map( ( product ) => (
				<RemovedFromCartItem key={ product.uuid } product={ product } />
			) ) }
		</ul>
	);
};
