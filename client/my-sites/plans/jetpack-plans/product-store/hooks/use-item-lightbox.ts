import { useCallback, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SelectorProduct } from '../../types';

export const useItemLightbox = () => {
	const [ currentItem, setCurrentItem ] = useState< SelectorProduct | null >( null );
	const clickMoreHandlerFactory = useCallback(
		( item: SelectorProduct ): VoidFunction | undefined => {
			return () => {
				recordTracksEvent( 'calypso_product_more_about_product_click', {
					product: item.productSlug,
				} );
				setCurrentItem( item );
			};
		},
		[]
	);

	return {
		currentItem,
		setCurrentItem,
		clickMoreHandlerFactory,
	};
};
