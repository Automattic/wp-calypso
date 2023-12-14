import { addQueryArgs, getQueryArgs } from '@wordpress/url';
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
	if ( ! products ) {
		return [ 1 ];
	}

	const supported = new Set( [
		1,
		...products.flatMap( ( p ) => p.supported_bundles?.map( ( { quantity } ) => quantity ) ),
	] );

	return [ ...supported ];
};

export function useProductBundleSize() {
	const { data: products } = useProductsQuery();

	const supportedBundleSizes = getSupportedBundleSizes( products );

	const { resetParams, getParamValue } = useURLQueryParams();

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
				/* Ideally we would like to use setParams from useURLQueryParams hook but
				 * for a reason it causes the Page context to throw exception when
				 * popping the history stack (browser back button). This implementation is
				 * a workaround for that issue.
				 */
				window.history.pushState(
					null,
					'',
					addQueryArgs( '', {
						...getQueryArgs( window.location.href ),
						[ BUNDLE_SIZE_PARAM_KEY ]: `${ size }`,
					} )
				);
			}
			setSelectedSize( size );
		},
		[ resetParams ]
	);

	return useMemo( () => {
		return {
			selectedSize: selectedSize ?? 1,
			setSelectedSize: setSelectedSizeAndLocationHash,
			availableSizes: supportedBundleSizes,
		};
	}, [ selectedSize, setSelectedSizeAndLocationHash, supportedBundleSizes ] );
}
