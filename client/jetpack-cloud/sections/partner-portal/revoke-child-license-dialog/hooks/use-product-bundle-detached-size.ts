import { useMemo } from 'react';
import { useProductBundleSize } from '../../issue-license-v2/hooks/use-product-bundle-size';

export type DetachSize = {
	size: number;
	count: number;
};

export function useProductBundleDetachedSize( originalSize: number ): DetachSize[] {
	const { availableSizes } = useProductBundleSize();

	return useMemo( () => {
		const detachedSizes = [];
		let remainingLicenses = originalSize - 1;

		for ( let i = availableSizes.indexOf( originalSize ) - 1; i > 0; i-- ) {
			const size = availableSizes[ i ];
			detachedSizes.push( {
				size,
				count: 1,
			} );
			remainingLicenses -= size;
		}

		detachedSizes.push( {
			size: 1,
			count: remainingLicenses,
		} );

		return detachedSizes;
	}, [ availableSizes, originalSize ] );
}
