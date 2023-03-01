import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';

const PRODUCTS = [
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_CRM,
];

export const useIndividualProducts = () =>
	useMemo( () => PRODUCTS.map( slugToSelectorProduct ) as SelectorProduct[], [] );
