import { CustomSelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { ItemVariantPrice } from './variant-price';
import type { ItemVariationPickerProps } from './types';

import './styles.scss';

export const ItemVariationDropDown: FunctionComponent< ItemVariationPickerProps > = ( {
	isDisabled,
	onChangeItemVariant,
	selectedItem,
	variants,
} ) => {
	const translate = useTranslate();

	const selectedVariantIndexRaw = variants.findIndex(
		( variant ) => variant.productId === selectedItem.product_id
	);
	// findIndex returns -1 if it fails and we want null.
	const selectedVariantIndex = selectedVariantIndexRaw > -1 ? selectedVariantIndexRaw : null;

	// wrapper around onChangeItemVariant to close up dropdown on change
	const handleChange = useCallback(
		( uuid: string, productSlug: string, productId: number ) => {
			onChangeItemVariant( uuid, productSlug, productId );
		},
		[ onChangeItemVariant ]
	);

	if ( variants.length < 2 ) {
		return null;
	}

	const compareTo = variants.find( ( variant ) => variant.productId === selectedItem.product_id );
	const options = variants.map( ( variant ) => ( {
		key: variant.variantLabel,
		name: <ItemVariantPrice variant={ variant } compareTo={ compareTo } />,
	} ) );

	if ( isDisabled ) {
		// TODO:
	}

	return (
		<CustomSelectControl
			className="item-variation-dropdown__select"
			label={ translate( 'Pick a product term' ) }
			describedBy={
				selectedVariantIndex !== null && selectedVariantIndex >= 0
					? translate( 'Currently selected term: %s', {
							args: variants[ selectedVariantIndex ]?.variantLabel,
							comment:
								'%s represents the product currently selected term, e.g. `One year`, or `One month`.',
					  } )
					: translate( 'No selected term' )
			}
			hideLabelFromVision
			options={ options }
			value={ options.find(
				( option ) =>
					selectedVariantIndex !== null &&
					option.key === variants[ selectedVariantIndex ]?.variantLabel
			) }
			onChange={ ( evt ) => {
				const variant = variants.find(
					( variant ) => variant.variantLabel === evt.selectedItem?.key
				);

				if ( variant ) {
					handleChange( selectedItem.uuid, variant.productSlug, variant.productId );
				}
			} }
		/>
	);
};
