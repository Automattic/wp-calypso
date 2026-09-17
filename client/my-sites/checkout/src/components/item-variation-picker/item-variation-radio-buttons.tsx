import { RadioButton } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, type FunctionComponent } from 'react';
import { mobileCheckoutStickySummaryRadioDotStyles } from 'calypso/my-sites/checkout/src/components/mobile-checkout-sticky-summary-styles';
import { useMobileCheckoutStickySummaryExperiment } from 'calypso/my-sites/checkout/src/hooks/use-mobile-checkout-sticky-summary-experiment';
import { ItemVariantRadioPrice } from './variant-radio-price';
import type { ItemVariationPickerProps, WPCOMProductVariant, OnChangeItemVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

const TermOptions = styled.ul`
	flex-basis: 100%;
	margin: 20px 0;
	padding: 0;

	&.is-mobile-checkout-sticky-summary {
		background: var( --color-surface );
		border: 1px solid var( --studio-gray-5 );
		border-radius: 8px;
		overflow: hidden;
	}
`;

const TermOptionsItem = styled.li`
	margin: 8px 0 0;
	padding: 0;
	list-style: none;

	:first-of-type {
		margin-top: 0;
	}

	.is-mobile-checkout-sticky-summary & {
		margin: 0;
	}

	.is-mobile-checkout-sticky-summary &:not( :last-of-type ) {
		border-block-end: 1px solid var( --studio-gray-5 );
	}

	/* Flatten the per-row card border from RadioButton — the ul is the card now. */
	.is-mobile-checkout-sticky-summary & .has-highlight {
		border-radius: 0;
	}
	.is-mobile-checkout-sticky-summary & .has-highlight::before,
	.is-mobile-checkout-sticky-summary & .has-highlight:hover::before {
		border: none;
	}

	/* Tighten the label and reposition the radio dot to the Figma's 16px gutter. */
	.is-mobile-checkout-sticky-summary & label {
		${ mobileCheckoutStickySummaryRadioDotStyles }
		padding-block: 16px;
		padding-inline-start: 40px;
		padding-inline-end: 16px;
		min-height: 0;
		gap: 8px;
		font-size: 16px;
		line-height: 24px;
		color: var( --studio-gray-100 );
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
					if ( ! isDisabled ) {
						onChangeItemVariant( selectedItem.uuid, productSlug, productId );
					}
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
	const { isMobileCheckoutStickySummary } = useMobileCheckoutStickySummaryExperiment();
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
			className={ clsx( 'item-variation-picker', {
				'is-mobile-checkout-sticky-summary': isMobileCheckoutStickySummary,
			} ) }
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
