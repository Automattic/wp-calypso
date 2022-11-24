import { RadioButton } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ItemVariantRadioPrice } from './variant-radio-price';
import type { ItemVariationPickerProps, WPCOMProductVariant, OnChangeItemVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import type { FunctionComponent } from 'react';

const TermOptions = styled.ul`
	flex-basis: 100%;
	margin: 20px 0 0;
	padding: 0;
`;

const TermOptionsItem = styled.li`
	margin: 8px 0 0;
	padding: 0;
	list-style: none;

	:first-of-type {
		margin-top: 0;
	}
`;

interface ProductVariantProps {
	radioButtonGroup: string;
	productVariant: WPCOMProductVariant;
	selectedItem: ResponseCartProduct;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
	compareTo?: WPCOMProductVariant;
}

const ProductVariant: FunctionComponent< ProductVariantProps > = ( {
	radioButtonGroup,
	productVariant,
	selectedItem,
	onChangeItemVariant,
	isDisabled,
	compareTo,
} ) => {
	const { variantLabel, productSlug, productId } = productVariant;
	const selectedProductSlug = selectedItem.product_slug;
	const isChecked = productSlug === selectedProductSlug;

	return (
		<TermOptionsItem>
			<RadioButton
				name={ radioButtonGroup }
				id={ productSlug + variantLabel }
				value={ productSlug }
				data-product-slug={ productSlug }
				checked={ isChecked }
				disabled={ isDisabled }
				onChange={ () => {
					! isDisabled && onChangeItemVariant( selectedItem.uuid, productSlug, productId );
				} }
				ariaLabel={ variantLabel }
				label={ <ItemVariantRadioPrice variant={ productVariant } compareTo={ compareTo } /> }
			/>
		</TermOptionsItem>
	);
};

export const ItemVariationRadioButtons: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	onChangeItemVariant,
	isDisabled,
	variants,
} ) => {
	const translate = useTranslate();
	if ( variants.length < 2 ) {
		return null;
	}

	const compareTo = variants[ 0 ];

	return (
		<TermOptions
			role="radiogroup"
			aria-label={ translate( 'Pick a product term' ) }
			className="item-variation-picker"
		>
			{ variants.map( ( productVariant: WPCOMProductVariant ) => (
				<ProductVariant
					radioButtonGroup={ `item-variation-picker ${ selectedItem.product_name } ${ selectedItem.uuid }` }
					key={ productVariant.productSlug + productVariant.variantLabel }
					selectedItem={ selectedItem }
					onChangeItemVariant={ onChangeItemVariant }
					isDisabled={ isDisabled }
					productVariant={ productVariant }
					compareTo={ compareTo }
				/>
			) ) }
		</TermOptions>
	);
};
