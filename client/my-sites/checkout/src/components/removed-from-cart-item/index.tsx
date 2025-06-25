import { ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { LoadingCopy } from '@automattic/wpcom-checkout';
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
	const [ isPlaceholder, setIsPlaceholder ] = useState( false );
	const translate = useTranslate();

	return (
		<div key={ product.uuid } className="removed-from-cart-item">
			{ isPlaceholder ? (
				<LoadingCopy width="350px" />
			) : (
				<>
					{ translate( '%(product)s was removed from the shopping cart.', {
						args: { product: product.product_name },
					} ) }
					<Button
						className="restorable-product-button"
						onClick={ async () => {
							setIsPlaceholder( true );

							await addProductsToCart( [ product ] );

							setRestorableProducts(
								restorableProducts.filter( ( p ) => p.uuid !== product.uuid )
							);
						} }
					>
						{ translate( 'Restore' ) }
					</Button>
				</>
			) }
		</div>
	);
};
