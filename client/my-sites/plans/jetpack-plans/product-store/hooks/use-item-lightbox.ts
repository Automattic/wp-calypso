import { useCallback, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EXTERNAL_PRODUCTS_LIST } from '../../constants';
import { SelectorProduct } from '../../types';

export const useItemLightbox = () => {
	const [ currentItem, setCurrentItem ] = useState< SelectorProduct | null >( null );
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
			setCurrentItem,
			onClickMoreInfoFactory,
		} ),
		[ currentItem, onClickMoreInfoFactory ]
	);
};
