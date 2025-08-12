import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { LoadingCopy, useRestorableProducts } from './index';
import type { AddProductsToCart, ResponseCartProduct } from '@automattic/shopping-cart';

const RemovedFromCartItemWrapper = styled.div`
	color: var( --studio-gray-100 );
	line-height: 20px;
	padding: 16px 0;
	font-size: 14px;
`;

const RestorableProductButton = styled( Button )`
	color: var( --studio-gray-100 ) !important;
	font-size: inherit;
	font-weight: 500;
	line-height: 20px;
	margin-left: 4px;
	height: auto;
	text-decoration: underline;
	text-underline-offset: 2px;
	padding: 0;
`;

export const RemovedFromCartItem = ( {
	product,
	addProductsToCart,
}: {
	product: ResponseCartProduct;
	addProductsToCart: AddProductsToCart;
} ) => {
	const [ restorableProducts, setRestorableProducts ] = useRestorableProducts();
	const [ isPlaceholder, setIsPlaceholder ] = useState( false );
	const translate = useTranslate();

	return (
		<RemovedFromCartItemWrapper key={ product.uuid }>
			{ isPlaceholder ? (
				<LoadingCopy width="350px" />
			) : (
				<>
					{ translate( '%(product)s was removed from the shopping cart.', {
						args: { product: product.product_name },
					} ) }
					<RestorableProductButton
						onClick={ async () => {
							setIsPlaceholder( true );

							await addProductsToCart( [ product ] );

							setRestorableProducts(
								restorableProducts.filter( ( p ) => p.uuid !== product.uuid )
							);
						} }
					>
						{ translate( 'Restore' ) }
					</RestorableProductButton>
				</>
			) }
		</RemovedFromCartItemWrapper>
	);
};
