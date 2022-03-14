import { RadioButton } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { ItemVariantPrice } from './variant-price';
import { useGetProductVariants } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import type { ItemVariationPickerProps, WPCOMProductVariant, OnChangeItemVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

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

export const ItemVariationRadioButtons: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	onChangeItemVariant,
	isDisabled,
	siteId,
	productSlug,
} ) => {
	const variants = useGetProductVariants( siteId, productSlug );

	if ( variants.length < 2 ) {
		return null;
	}

	return (
		<TermOptions className="item-variation-picker">
			{ variants.map( ( productVariant: WPCOMProductVariant ) => (
				<ProductVariant
					key={ productVariant.productSlug + productVariant.variantLabel }
					selectedItem={ selectedItem }
					onChangeItemVariant={ onChangeItemVariant }
					isDisabled={ isDisabled }
					productVariant={ productVariant }
				/>
			) ) }
		</TermOptions>
	);
};

interface ProductVariantProps {
	productVariant: WPCOMProductVariant;
	selectedItem: ResponseCartProduct;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
}

const ProductVariant: FunctionComponent< ProductVariantProps > = ( {
	productVariant,
	selectedItem,
	onChangeItemVariant,
	isDisabled,
} ) => {
	const translate = useTranslate();
	const { variantLabel, productSlug, productId } = productVariant;
	const selectedProductSlug = selectedItem.product_slug;
	const isChecked = productSlug === selectedProductSlug;

	return (
		<TermOptionsItem>
			<RadioButton
				name={ productSlug + variantLabel }
				id={ productSlug + variantLabel }
				value={ productSlug }
				checked={ isChecked }
				disabled={ isDisabled }
				onChange={ () => {
					! isDisabled && onChangeItemVariant( selectedItem.uuid, productSlug, productId );
				} }
				ariaLabel={ translate( 'Select a different term length' ) as string }
				label={ <ItemVariantPrice variant={ productVariant } /> }
				children={ [] }
			/>
		</TermOptionsItem>
	);
};
