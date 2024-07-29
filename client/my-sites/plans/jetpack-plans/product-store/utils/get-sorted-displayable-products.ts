import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	JETPACK_AI_PRODUCTS,
	JETPACK_STATS_PRODUCTS,
	JETPACK_SOCIAL_V1_PRODUCTS,
} from '@automattic/calypso-products';
import { SelectorProduct } from '../../types';

const setProductsInPosition = ( slugs: ReadonlyArray< string >, position: number ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: position } ), {} );

const DISPLAYABLE_PRODUCT_POSITION_MAP: Record< string, number > = {
	...setProductsInPosition( JETPACK_AI_PRODUCTS, 1 ),
	...setProductsInPosition( JETPACK_BACKUP_PRODUCTS, 2 ),
	...setProductsInPosition( JETPACK_BOOST_PRODUCTS, 3 ),
	...setProductsInPosition( JETPACK_SCAN_PRODUCTS, 4 ),
	...setProductsInPosition( JETPACK_SOCIAL_PRODUCTS, 5 ),
	...setProductsInPosition( JETPACK_SOCIAL_V1_PRODUCTS, 5 ),
	...setProductsInPosition( JETPACK_ANTI_SPAM_PRODUCTS, 6 ),
	...setProductsInPosition( JETPACK_VIDEOPRESS_PRODUCTS, 7 ),
	...setProductsInPosition( JETPACK_CRM_PRODUCTS, 8 ),
	...setProductsInPosition( JETPACK_SEARCH_PRODUCTS, 9 ),
	...setProductsInPosition( JETPACK_STATS_PRODUCTS, 10 ),
};

const sortByProductPosition = ( productA: SelectorProduct, productB: SelectorProduct ) => {
	return (
		DISPLAYABLE_PRODUCT_POSITION_MAP[ productA.productSlug ] -
		DISPLAYABLE_PRODUCT_POSITION_MAP[ productB.productSlug ]
	);
};

export const getSortedDisplayableProducts = ( products: SelectorProduct[] ): SelectorProduct[] => {
	return [ ...products ].sort( sortByProductPosition );
};
