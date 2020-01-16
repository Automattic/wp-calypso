/**
 * External Dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal Dependencies
 */
import { LoadingProps } from './loadingProps';

/**
 * This component displays when the variation is unknown and an API call needs to be made
 */
const LoadingVariations: FunctionComponent< LoadingProps > = ( {
	variation,
	isLoading,
	children,
} ) => {
	return variation == null && isLoading ? <>{ children }</> : null;
};

export default LoadingVariations;
