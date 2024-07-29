import { getQueryArg } from '@wordpress/url';
import { useEffect, useState } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { ShoppingCartItem } from '../types';

export default function useProductsBySlug() {
	const { data } = useProductsQuery();

	const [ selectedProductsBySlug, setSelectedProductsSlug ] = useState< ShoppingCartItem[] | [] >(
		[]
	);

	useEffect( () => {
		if ( data ) {
			const slugs = getQueryArg( window.location.href, 'product_slug' )?.toString().split( ',' );
			if ( ! slugs ) {
				return setSelectedProductsSlug( [] );
			}
			const allProducts = slugs
				.map( ( slug ) => {
					return { ...data.find( ( product ) => product.slug === slug ), quantity: 1 };
				} )
				.filter( ( product ) => product ) as ShoppingCartItem[];
			setSelectedProductsSlug( allProducts );
		}
	}, [ data ] );

	return {
		selectedProductsBySlug,
	};
}
