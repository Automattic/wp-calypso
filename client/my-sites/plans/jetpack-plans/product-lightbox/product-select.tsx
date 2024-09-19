import {
	isJetpackMultiOptionProduct,
	JETPACK_RELATED_PRODUCTS_MAP,
} from '@automattic/calypso-products';
import { useMemo, useCallback, type FC } from 'react';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import slugToSelectorProduct from '../slug-to-selector-product';
import { PRODUCT_OPTIONS_HEADER, PRODUCT_OPTIONS } from './constants';
import type { SelectorProduct } from '../types';

interface ProductSelectProps {
	product: SelectorProduct;
	siteId: number | null;
	onChangeProduct: ( product: SelectorProduct | null ) => void;
}

const ProductSelect: FC< ProductSelectProps > = ( { product, siteId, onChangeProduct } ) => {
	const dispatch = useDispatch();

	const variantOptions = useMemo( () => {
		const variants = JETPACK_RELATED_PRODUCTS_MAP[ product.productSlug ] || [];
		return variants.map( ( itemSlug ) => ( {
			id: itemSlug,
			answerText: PRODUCT_OPTIONS[ itemSlug ].toString(),
		} ) );
	}, [ product.productSlug ] );

	const onChangeOption = useCallback(
		( productSlug: string ) => {
			onChangeProduct( slugToSelectorProduct( productSlug ) );

			// Tracking when variant selected inside the lightbox
			dispatch(
				recordTracksEvent( 'calypso_product_lightbox_variant_select', {
					site_id: siteId,
					product_slug: productSlug,
				} )
			);
		},
		[ onChangeProduct, dispatch, siteId ]
	);

	const shouldShowOptions =
		isJetpackMultiOptionProduct( product.productSlug ) && variantOptions.length > 1;

	if ( ! shouldShowOptions ) {
		return <></>;
	}

	return (
		<div>
			<div className="product-lightbox__variants-options">
				<MultipleChoiceQuestion
					name="product-variants"
					question={ PRODUCT_OPTIONS_HEADER[ product?.productSlug ].toString() }
					answers={ variantOptions }
					selectedAnswerId={ product?.productSlug }
					onAnswerChange={ onChangeOption }
					shouldShuffleAnswers={ false }
				/>
			</div>
		</div>
	);
};

export default ProductSelect;
