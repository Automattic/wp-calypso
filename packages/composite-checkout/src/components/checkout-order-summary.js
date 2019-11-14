/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { useLineItems } from '../public-api';

export default function CheckoutOrderSummary() {
	const [ items ] = useLineItems();

	return (
		<React.Fragment>
			<ProductList>
				{ items.map( ( product, index ) => {
					return <ProductListItem key={ index }>{ product.label }</ProductListItem>;
				} ) }
			</ProductList>
		</React.Fragment>
	);
}

const ProductList = styled.ul`
	margin: 0;
	padding: 0;
`;

const ProductListItem = styled.li`
	margin: 0;
	padding: 0;
	list-style-type: none;
`;
