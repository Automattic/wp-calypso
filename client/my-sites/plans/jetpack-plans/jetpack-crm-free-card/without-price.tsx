import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ProductCardWithoutPrice from 'calypso/components/jetpack/card/product-without-price';
import { storePlan } from 'calypso/jetpack-connect/persistence-utils';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import type { Duration, SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

export type CardWithoutPriceProps = {
	fullWidth?: boolean;
	duration: Duration;
	siteId: number | null;
};

const CardWithoutPrice: React.FC< CardWithoutPriceProps > = ( { fullWidth, duration, siteId } ) => {
	const slug =
		duration === TERM_MONTHLY ? PRODUCT_JETPACK_CRM_FREE_MONTHLY : PRODUCT_JETPACK_CRM_FREE;
	const product = slugToSelectorProduct( slug ) as SelectorProduct;

	const dispatch = useDispatch();
	const trackCallback = useCallback(
		() =>
			dispatch(
				recordTracksEvent( 'calypso_product_jpcrmfree_click', {
					site_id: siteId ?? undefined,
				} )
			),
		[ dispatch, siteId ]
	);

	const onButtonClick = useCallback( () => {
		storePlan( slug );
		trackCallback();
	}, [ slug, trackCallback ] );

	return (
		<ProductCardWithoutPrice
			fullWidth={ fullWidth }
			className="jetpack-crm-free-card"
			productSlug={ slug }
			displayName={ product.displayName }
			description={ product.description }
			productFeatures={ product.features.items.map( ( { text } ) => text ) }
			buttonLabel={ product.buttonLabel }
			buttonHref={ product.externalUrl }
			onButtonClick={ onButtonClick }
		/>
	);
};

export default CardWithoutPrice;
