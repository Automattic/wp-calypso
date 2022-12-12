import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { EXTERNAL_PRODUCTS_LIST } from '../../constants';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';
import { sanitizeLocationHash } from '../utils/sanitize-location-hash';

export const useProductLightbox = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ currentProduct, setCurrentProduct ] = useState< SelectorProduct | null >( null );

	useEffect( () => {
		setCurrentProduct( slugToSelectorProduct( sanitizeLocationHash( window.location.hash ) ) );
	}, [ translate ] );

	const setCurrentProductAndLocationHash = useCallback( ( product: SelectorProduct | null ) => {
		setCurrentProduct( product );
		const hash = `#${ product?.productSlug || '' }`;
		window.history.pushState( null, '', hash );
	}, [] );

	const onClickMoreInfoFactory = useCallback(
		( product: SelectorProduct ): VoidFunction => {
			return () => {
				dispatch(
					recordTracksEvent( 'calypso_jetpack_product_store_more_about_product_click', {
						product_slug: product.productSlug,
					} )
				);

				if ( ! EXTERNAL_PRODUCTS_LIST.includes( product.productSlug ) ) {
					setCurrentProduct( product );
				}
			};
		},
		[ dispatch ]
	);

	return useMemo(
		() => ( {
			currentProduct,
			setCurrentProduct: setCurrentProductAndLocationHash,
			onClickMoreInfoFactory,
		} ),
		[ currentProduct, onClickMoreInfoFactory, setCurrentProductAndLocationHash ]
	);
};
