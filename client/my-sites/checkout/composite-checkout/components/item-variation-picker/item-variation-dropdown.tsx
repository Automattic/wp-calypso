import { CustomSelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
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

	if ( variants.length < 2 ) {
		return null;
	}

	const compareTo = variants.find( ( variant ) => variant.productId === selectedItem.product_id );
	const options = variants
		.sort( ( { productId } ) => ( productId === selectedItem.product_id ? -1 : 1 ) )
		.map( ( variant ) => ( {
			key: variant.variantLabel,
			name: variant.variantLabel,
			__experimentalHint: <ItemVariantPrice variant={ variant } compareTo={ compareTo } />,
		} ) );

	if ( isDisabled ) {
		// TODO:
	}

	return (
		<CustomSelectControl
			className="item-variation-dropdown__select"
			label={ translate( 'Pick a product term' ) }
			hideLabelFromVision
			options={ options }
			onChange={ ( evt ) => {
				const variant = variants.find(
					( { variantLabel } ) => variantLabel === evt.selectedItem?.key
				);

				if ( variant ) {
					onChangeItemVariant( selectedItem?.uuid, variant.productSlug, variant.productId );
				}
			} }
		/>
	);
};
