import { RadioButton } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, type FunctionComponent } from 'react';
import { ItemVariantRadioPrice } from './variant-radio-price';
import type { ItemVariationPickerProps, WPCOMProductVariant, OnChangeItemVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

const TermOptions = styled.ul`
	flex-basis: 100%;
	margin: 20px 0;
	padding: 0;
	background: #ffffff;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	overflow: hidden;

	& > li {
		margin: 0;
		border-bottom: 1px solid #f0f0f0;
	}

	& > li:last-child {
		border-bottom: none;
	}

	& > li > div {
		border-radius: 0;
	}

	& > li > div.is-checked {
		background: linear-gradient( 135deg, rgba( 255, 255, 255, 0 ) 0%, #fff 50%, #e6f1ff 100% );
	}

	& > li > div::before,
	& > li > div:hover::before {
		border: none;
	}

	& > li > div > label {
		min-height: 64px;
		padding-top: 2px;
		padding-bottom: 0;

		@media ( min-width: 960px ) {
			min-height: 72px;
		}
	}
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
	selectedProductSlug: string;
}

const ProductVariant: FunctionComponent< ProductVariantProps > = ( {
	radioButtonGroup,
	productVariant,
	selectedItem,
	onChangeItemVariant,
	isDisabled,
	compareTo,
	selectedProductSlug,
} ) => {
	const { variantLabel, productSlug, productId } = productVariant;
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
				label={ <ItemVariantRadioPrice variant={ productVariant } compareTo={ compareTo } /> }
				highlighted
				compact
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
	const [ optimisticSelectedItem, setOptimisticSelectedItem ] = useState(
		selectedItem.product_slug
	);

	useEffect( () => {
		setOptimisticSelectedItem( selectedItem.product_slug );
	}, [ selectedItem ] );

	if ( variants.length < 2 ) {
		return null;
	}

	const compareTo = variants[ 0 ];

	const onChangeItemVariantCallback = ( uuid: string, productSlug: string, productId: number ) => {
		setOptimisticSelectedItem( productSlug );
		onChangeItemVariant( uuid, productSlug, productId );
	};

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
					onChangeItemVariant={ onChangeItemVariantCallback }
					isDisabled={ isDisabled }
					productVariant={ productVariant }
					compareTo={ compareTo }
					selectedProductSlug={ optimisticSelectedItem }
				/>
			) ) }
		</TermOptions>
	);
};
