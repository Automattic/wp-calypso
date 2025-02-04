import { isJetpackTieredProduct } from '@automattic/calypso-products';
import { SelectDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, type FC } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';
import { getProductPartsFromAlias } from 'calypso/my-sites/checkout/src/hooks/use-prepare-products-for-cart';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import slugToSelectorProduct from '../slug-to-selector-product';
import useItemPrice from '../use-item-price';
import {
	PRODUCT_OPTIONS_HEADER,
	PRODUCT_OPTIONS_HEADER_INFO_CONTENT,
	PRODUCT_TIER_OPTIONS,
} from './constants';
import type { SelectorProduct } from '../types';

interface QuantityDropdownProps {
	product: SelectorProduct;
	siteId: number | null;
	onChangeProduct: ( product: SelectorProduct | null ) => void;
}

const QuantityDropdown: FC< QuantityDropdownProps > = ( { product, siteId, onChangeProduct } ) => {
	const dispatch = useDispatch();
	const listPrices = useItemPrice( siteId, product, product?.monthlyProductSlug || '' );
	const translate = useTranslate();

	const tierOptions = useMemo( () => {
		if ( ! isJetpackTieredProduct( product.productSlug ) ) {
			return [];
		}

		const tiers = listPrices.priceTierList || [];

		return tiers.map( ( tier ) => {
			if ( ! tier.maximum_units ) {
				return;
			}

			const id = `${ product.productSlug }:-q-${ tier.maximum_units }`;

			return {
				value: id,
				label: PRODUCT_TIER_OPTIONS[ id ].toString(),
			};
		} );
	}, [ listPrices.priceTierList, product.productSlug ] );

	const onDropdownTierSelect = useCallback(
		( { value: slug }: { value: string } ) => {
			onChangeProduct( slugToSelectorProduct( slug ) );
			const { slug: productSlug, quantity } = getProductPartsFromAlias( slug );

			dispatch(
				recordTracksEvent( 'calypso_product_lightbox_dropdown_tier_select', {
					site_id: siteId,
					product_slug: productSlug,
					quantity,
				} )
			);
		},
		[ onChangeProduct, dispatch, siteId ]
	);

	if ( ! isJetpackTieredProduct( product.productSlug ) || tierOptions.length < 1 ) {
		return <></>;
	}

	return (
		<div className="product-lightbox__variants-dropdown">
			<FormFieldset>
				<FormLegend>
					<span>{ PRODUCT_OPTIONS_HEADER[ product?.productSlug ] }</span>
					<InfoPopover
						position="right"
						screenReaderText={ translate( 'Learn more' ) }
						className="product-lightbox__variants-dropdown--popover"
					>
						{ preventWidows( PRODUCT_OPTIONS_HEADER_INFO_CONTENT[ product?.productSlug ] ) }
					</InfoPopover>
				</FormLegend>
				<SelectDropdown
					className="product-lightbox__tiers-dropdown"
					options={ tierOptions }
					onSelect={ onDropdownTierSelect }
					initialSelected={ tierOptions[ 0 ]?.value }
				/>
			</FormFieldset>
		</div>
	);
};

export default QuantityDropdown;
