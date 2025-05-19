import { ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useRestorableProducts } from 'calypso/my-sites/checkout/src/components/restorable-products-context';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import './style.scss';

interface LoadingContainerProps {
	width?: string;
	height?: string;
}

const pulse = keyframes`
  0% {
	opacity: 1;
  }

  70% {
	opacity: 0.5;
  }

  100% {
	opacity: 1;
  }
`;

const LoadingCopy = styled.p< LoadingContainerProps >`
	font-size: 14px;
	height: ${ ( props ) => props.height ?? '16px' };
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	margin: 8px 0 0 0;
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;
	width: ${ ( props ) => props.width ?? 'inherit' };
	box-sizing: border-box;

	.rtl & {
		margin: 8px 0 0 0;
	}
`;

export const RemovedFromCartItem = ( { product }: { product: ResponseCartProduct } ) => {
	const cartKey = useCartKey();
	const [ restorableProducts, setRestorableProducts ] = useRestorableProducts();
	const { addProductsToCart } = useShoppingCart( cartKey );
	const [ isPlaceholder, setIsPlaceholder ] = useState( false );
	const translate = useTranslate();

	return (
		<li key={ product.uuid } className="removed-from-cart-item">
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
