import { useCallback, useState } from 'react';
import { useURLQueryParams } from '../../hooks';

const AVAILABLE_SIZES = [ 1, 5, 10, 20, 50, 75, 100 ]; //TO-DO: We will need to get this from the API

const BUNDLE_SIZE_PARAM_KEY = 'bundle_size';

// Parse the location hash to get the selected product bundle size
// If the hash is not found, return the default size (1)
const parseLocationHash = ( value: string ) => {
	return AVAILABLE_SIZES.find( ( size ) => value === `${ size }` ) || 1;
};

export function useProductBundleSize() {
	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const [ selectedSize, setSelectedSize ] = useState(
		parseLocationHash( getParamValue( BUNDLE_SIZE_PARAM_KEY ) )
	);

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

	return {
		selectedSize,
		setSelectedSize: setSelectedSizeAndLocationHash,
		availableSizes: AVAILABLE_SIZES,
	};
}
