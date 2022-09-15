import { useCallback, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EXTERNAL_PRODUCTS_LIST } from '../../constants';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';
import { sanitizeLocationHash } from '../utils/sanitize-location-hash';

export const useProductLightbox = () => {
	const [ currentProduct, setCurrentProduct ] = useState< SelectorProduct | null >( () =>
		slugToSelectorProduct( sanitizeLocationHash( window.location.hash ) )
	);

	const setCurrentProductAndLocationHash = useCallback( ( product: SelectorProduct | null ) => {
		setCurrentProduct( product );
		const hash = `#${ product?.productSlug || '' }`;
		window.history.pushState( null, '', hash );
	}, [] );

	const onClickMoreInfoFactory = useCallback( ( product: SelectorProduct ): VoidFunction => {
		return () => {
			recordTracksEvent( 'calypso_product_more_about_product_click', {
				product: product.productSlug,
			} );

			if ( ! EXTERNAL_PRODUCTS_LIST.includes( product.productSlug ) ) {
				setCurrentProduct( product );
			}
		};
	}, [] );

	return useMemo(
		() => ( {
			currentProduct,
			setCurrentProduct: setCurrentProductAndLocationHash,
			onClickMoreInfoFactory,
		} ),
		[ currentProduct, onClickMoreInfoFactory, setCurrentProductAndLocationHash ]
	);
};
