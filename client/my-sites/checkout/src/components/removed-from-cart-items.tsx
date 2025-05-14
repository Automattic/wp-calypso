import { useShoppingCart } from '@automattic/shopping-cart';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRestorableProducts } from 'calypso/my-sites/checkout/src/components/restorable-products-context';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';

export const RemovedFromCartItems = () => {
	const cartKey = useCartKey();
	const [ restorableProducts, setRestorableProducts ] = useRestorableProducts();
	const { addProductsToCart } = useShoppingCart( cartKey );
	const translate = useTranslate();

	if ( ! restorableProducts || restorableProducts.length === 0 ) {
		return null;
	}

	return (
		<ul className="removed-from-cart-items">
			{ restorableProducts.map( ( product ) => (
				<li key={ product.uuid }>
					{ translate( '%(product)s was removed from the shopping cart.', {
						args: { product: product.product_name },
					} ) }
					<Button
						className="restorable-product-button"
						onClick={ async () => {
							await addProductsToCart( [ product ] );

							setRestorableProducts(
								restorableProducts.filter( ( p ) => p.uuid !== product.uuid )
							);
						} }
					>
						{ translate( 'Restore' ) }
					</Button>
				</li>
			) ) }
		</ul>
	);
};
