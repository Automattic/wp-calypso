import { useCallback, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EXTERNAL_PRODUCTS_LIST } from '../../constants';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';

export const useItemLightbox = () => {
	const item = slugToSelectorProduct( window.location.hash.substring( 1 ) );

	const [ currentItem, setCurrentItem ] = useState< SelectorProduct | null >( item );

	const clearCurrentItem = () => {
		setCurrentItem( null );
		window.location.hash = '';
	};

	const onClickMoreInfoFactory = useCallback( ( item: SelectorProduct ): VoidFunction => {
		return () => {
			recordTracksEvent( 'calypso_product_more_about_product_click', {
				product: item.productSlug,
			} );

			if ( ! EXTERNAL_PRODUCTS_LIST.includes( item.productSlug ) ) {
				setCurrentItem( item );
			}
		};
	}, [] );

	return useMemo(
		() => ( {
			currentItem,
			clearCurrentItem,
			onClickMoreInfoFactory,
		} ),
		[ currentItem, onClickMoreInfoFactory ]
	);
};
