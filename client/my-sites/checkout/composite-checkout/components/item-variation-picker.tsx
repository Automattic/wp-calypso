/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * External dependencies
 */
import React, { Component, FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { RadioButton } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { WPCOMCartItem } from '../types/checkout-cart';
import { isWpComPlan, isWpComBusinessPlan } from 'calypso/lib/plans';
import { isMonthly } from 'calypso/lib/plans/constants';

export type WPCOMProductSlug = string;

export type WPCOMProductVariant = {
	variantLabel: string;
	variantDetails: Component;
	productSlug: WPCOMProductSlug;
	productId: number;
};

export type ItemVariationPickerProps = {
	selectedItem: WPCOMCartItem;
	getItemVariants: ( productSlug: WPCOMProductSlug ) => WPCOMProductVariant[];
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
	isMonthlyPricingTest?: boolean;
};

export type OnChangeItemVariant = (
	uuid: string,
	productSlug: WPCOMProductSlug,
	productId: number
) => void;

export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	getItemVariants,
	onChangeItemVariant,
	isDisabled,
	isMonthlyPricingTest = false,
} ) => {
	const variants = getItemVariants( selectedItem.wpcom_meta.product_slug );
	const isBRLCurrency = 'BRL' === selectedItem?.amount?.currency;
	const showBusinessMonthly =
		isBRLCurrency && isWpComBusinessPlan( selectedItem.wpcom_meta.product_slug );

	if ( variants.length < 2 ) {
		return null;
	}

	return (
		<TermOptions>
			{ variants.map(
				( productVariant: WPCOMProductVariant ) =>
					( isMonthlyPricingTest ||
						! isWpcomMonthlyPlan( productVariant ) ||
						showBusinessMonthly ) && (
						<ProductVariant
							key={ productVariant.variantLabel }
							selectedItem={ selectedItem }
							onChangeItemVariant={ onChangeItemVariant }
							isDisabled={ isDisabled }
							productVariant={ productVariant }
						/>
					)
			) }
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
	selectedItem: WPCOMCartItem;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
} ) {
	const translate = useTranslate();
	const { variantLabel, variantDetails, productSlug, productId } = productVariant;
	const selectedProductSlug = selectedItem.wpcom_meta.product_slug;
	const isChecked = productSlug === selectedProductSlug;

	return (
		<TermOptionsItem>
			<RadioButton
				name={ variantLabel }
				id={ variantLabel }
				value={ productSlug }
				checked={ isChecked }
				disabled={ isDisabled }
				onChange={ () => {
					! isDisabled &&
						onChangeItemVariant( selectedItem.wpcom_meta.uuid, productSlug, productId );
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
	margin: 12px 0 0;
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
`;

function isWpcomMonthlyPlan( { productSlug }: WPCOMProductVariant ): boolean {
	return isWpComPlan( productSlug ) && isMonthly( productSlug );
}
