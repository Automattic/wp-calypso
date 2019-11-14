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
		<ProductList>
			{ items.map( product => {
				return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
			} ) }
		</ProductList>
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
