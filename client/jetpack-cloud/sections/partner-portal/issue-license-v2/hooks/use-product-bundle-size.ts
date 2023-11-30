import { useCallback, useEffect, useMemo, useState } from 'react';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { useURLQueryParams } from '../../hooks';

const BUNDLE_SIZE_PARAM_KEY = 'bundle_size';

// Parse the location hash to get the selected product bundle size
// If the hash is not found, return the default size (1)
const parseLocationHash = ( supportedBundleSizes: number[], value: string ) => {
	return supportedBundleSizes.find( ( size ) => value === `${ size }` ) || 1;
};

const getSupportedBundleSizes = ( products?: APIProductFamilyProduct[] ) => {
	if ( products?.length ) {
		return [
			1,
			...products.reduce( ( set, product ) => {
				product.supported_bundles.forEach( ( { quantity } ) => {
					set.add( quantity );
				} );

				return set;
			}, new Set< number >() ),
		];
	}

	return [ 1 ];
};

export function useProductBundleSize() {
	const { data: products } = useProductsQuery();

	const supportedBundleSizes = getSupportedBundleSizes( products );

	const { setParams, resetParams, getParamValue } = useURLQueryParams();

	const [ selectedSize, setSelectedSize ] = useState< number | undefined >( undefined );

	// When products are changed, we need to reevaluate if selected bundle size is still valid
	useEffect( () => {
		setSelectedSize(
			parseLocationHash( supportedBundleSizes, getParamValue( BUNDLE_SIZE_PARAM_KEY ) )
		);
	}, [ getParamValue, supportedBundleSizes ] );

	const setSelectedSizeAndLocationHash = useCallback(
		( size: number ) => {
			if ( size === 1 ) {
				resetParams( [ BUNDLE_SIZE_PARAM_KEY ] );
			} else {
				setParams( [
					{
						key: BUNDLE_SIZE_PARAM_KEY,
						value: `${ size }`,
					},
				] );
			}
			setSelectedSize( size );
		},
		[ resetParams, setParams ]
	);

	return useMemo( () => {
		return {
			selectedSize: selectedSize ?? 1,
			setSelectedSize: setSelectedSizeAndLocationHash,
			availableSizes: supportedBundleSizes,
		};
	}, [ selectedSize, setSelectedSizeAndLocationHash, supportedBundleSizes ] );
}
