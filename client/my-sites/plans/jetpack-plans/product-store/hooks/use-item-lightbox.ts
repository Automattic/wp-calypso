import { useCallback, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EXTERNAL_PRODUCTS_LIST } from '../../constants';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';
import { sanitizeLocationHash } from '../utils/sanitize-location-hash';

export const useItemLightbox = () => {
	const [ currentItem, setCurrentItem ] = useState< SelectorProduct | null >( () =>
		slugToSelectorProduct( sanitizeLocationHash( window.location.hash ) )
	);

	const setCurrentItemAndLocationHash = useCallback( ( item: SelectorProduct | null ) => {
		setCurrentItem( item );
		window.location.hash = item ? item.productSlug : '';
	}, [] );

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
			setCurrentItem: setCurrentItemAndLocationHash,
			onClickMoreInfoFactory,
		} ),
		[ currentItem, onClickMoreInfoFactory, setCurrentItemAndLocationHash ]
	);
};
