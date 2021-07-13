/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { storePlan } from 'calypso/jetpack-connect/persistence-utils';
import ProductCardWithoutPrice from 'calypso/components/jetpack/card/product-without-price';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';

/**
 * Type dependencies
 */
import type { Duration, SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

/**
 * Style dependencies
 */
import './style.scss';

type OwnProps = {
	fullWidth?: boolean;
	duration: Duration;
	siteId: number | null;
};

const JetpackCrmFreeCard: React.FC< OwnProps > = ( { fullWidth, duration, siteId } ) => {
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
			productFeatures={ product.features.items.map( ( i ) => i.text ) }
			buttonLabel={ product.buttonLabel }
			buttonHref={ product.externalUrl }
			onButtonClick={ onButtonClick }
		/>
	);
};

export default JetpackCrmFreeCard;
