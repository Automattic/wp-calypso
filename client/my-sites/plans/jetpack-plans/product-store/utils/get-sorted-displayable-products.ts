import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
} from '@automattic/calypso-products';
import { SelectorProduct } from '../../types';

const setProductsInPosition = ( slugs: ReadonlyArray< string >, position: number ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: position } ), {} );

const DISPLAYABLE_PRODUCT_POSITION_MAP: Record< string, number > = {
	...setProductsInPosition( JETPACK_BACKUP_PRODUCTS, 0 ),
	...setProductsInPosition( JETPACK_ANTI_SPAM_PRODUCTS, 1 ),
	...setProductsInPosition( JETPACK_SCAN_PRODUCTS, 2 ),
	...setProductsInPosition( JETPACK_VIDEOPRESS_PRODUCTS, 3 ),
	...setProductsInPosition( JETPACK_SEARCH_PRODUCTS, 4 ),
	...setProductsInPosition( JETPACK_BOOST_PRODUCTS, 5 ),
	// TODO - Set Jetpack social product order here
	...setProductsInPosition( JETPACK_CRM_PRODUCTS, 7 ),
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
