/* eslint-disable @typescript-eslint/no-use-before-define */

import { RadioButton } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import * as React from 'react';
import { useGetProductVariants } from '../../hooks/product-variants';
import type { ItemVariationPickerProps, WPCOMProductVariant, OnChangeItemVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

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
		<TermOptions className="item-variation-radio-buttons">
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

function ProductVariant( {
	productVariant,
	selectedItem,
	onChangeItemVariant,
	isDisabled,
}: {
	productVariant: WPCOMProductVariant;
	selectedItem: ResponseCartProduct;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
} ) {
	const translate = useTranslate();
	const { variantLabel, variantDetails, productSlug, productId } = productVariant;
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
				label={
					<React.Fragment>
						<VariantLabel>{ variantLabel }</VariantLabel>
						{ variantDetails }
					</React.Fragment>
				}
				children={ [] }
			/>
		</TermOptionsItem>
	);
}

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

const VariantLabel = styled.span`
	flex: 1;
	display: flex;
`;
