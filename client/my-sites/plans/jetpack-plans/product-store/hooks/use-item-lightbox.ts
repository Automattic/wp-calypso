import { isEnabled } from '@automattic/calypso-config';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SelectorProduct } from '../../types';

export const useItemLightbox = () => {
	const [ currentItem, setCurrentItem ] = useState< SelectorProduct | null >( null );
	const clickMoreHandlerFactory = ( item: SelectorProduct ): VoidFunction | undefined => {
		return isEnabled( 'jetpack/pricing-page-product-lightbox' )
			? () => {
					recordTracksEvent( 'calypso_product_more_about_product_click', {
						product: item.productSlug,
					} );
					setCurrentItem( item );
			  }
			: undefined;
	};

	return {
		currentItem,
		setCurrentItem,
		clickMoreHandlerFactory,
	};
};
