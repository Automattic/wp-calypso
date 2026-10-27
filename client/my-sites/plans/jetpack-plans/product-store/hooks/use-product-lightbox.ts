import { isJetpackPlanSlug } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { EXTERNAL_PRODUCTS_LIST, INDIRECT_CHECKOUT_PRODUCTS_LIST } from '../../constants';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';
import useIsOnSale from '../../use-is-on-sale';
import { sanitizeLocationHash } from '../utils/sanitize-location-hash';

export const useProductLightbox = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ currentProduct, setCurrentProduct ] = useState< SelectorProduct | null >( null );
	const isOnSale = useIsOnSale();

	/*
	 * TO-DO: Ideally we want PlanList (holds all translatable data related to Jetpack plans) to be a react hook so it is aware of translation
	 * changes. While fixing it will require huge refactoring, for now we useEffect here to manually recreate the product object.
	 * This should be removed once we have converted PlanList and slugToSelectorProduct into a react hook.
	 */
	useEffect( () => {
		const slug = sanitizeLocationHash( window.location.hash );
		if ( ! slug ) {
			return;
		}

		// A linked bundle opens only while it is on sale, so the hash cannot offer a retired plan.
		const isOffSaleBundle = isJetpackPlanSlug( slug ) && ! isOnSale( slug );
		setCurrentProduct( isOffSaleBundle ? null : slugToSelectorProduct( slug ) );
	}, [ translate, isOnSale ] );

	const setCurrentProductAndLocationHash = useCallback( ( product: SelectorProduct | null ) => {
		setCurrentProduct( product );
		const hash = `#${ product?.productSlug || '' }`;
		window.history.pushState( null, '', hash );
	}, [] );

	const onClickMoreInfoFactory = useCallback(
		( product: SelectorProduct ): VoidFunction => {
			return () => {
				dispatch(
					recordTracksEvent( 'calypso_jetpack_product_store_more_about_product_click', {
						product_slug: product.productSlug,
					} )
				);

				// We don't need to show the lightbox for external and indirect checkout products since they have their own landing pages.
				if (
					! EXTERNAL_PRODUCTS_LIST.includes( product.productSlug ) &&
					! INDIRECT_CHECKOUT_PRODUCTS_LIST.includes( product.productSlug )
				) {
					setCurrentProduct( product );
				}
			};
		},
		[ dispatch ]
	);

	return useMemo(
		() => ( {
			currentProduct,
			setCurrentProduct: setCurrentProductAndLocationHash,
			onClickMoreInfoFactory,
		} ),
		[ currentProduct, onClickMoreInfoFactory, setCurrentProductAndLocationHash ]
	);
};
