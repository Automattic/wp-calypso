/**
 * External dependencies
 */
import React, { Component, FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { WPCOMCartItem } from '../types';
import RadioButton from './radio-button';
import { VariantRequestStatus } from '../hooks/use-shopping-cart';

export type WPCOMProductSlug = string;

export type WPCOMProductVariant = {
	variantLabel: string;
	variantDetails: Component;
	productSlug: WPCOMProductSlug;
	productId: number;
};

export type ItemVariationPickerProps = {
	selectedItem: WPCOMCartItem;
	variantRequestStatus: VariantRequestStatus;
	variantSelectOverride: { uuid: string; overrideSelectedProductSlug: string }[];
	getItemVariants: ( arg0: WPCOMProductSlug ) => WPCOMProductVariant[];
	onChangeItemVariant: ( arg0: string, arg1: WPCOMProductSlug, arg2: number ) => void;
	isDisabled: boolean;
};

export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	variantSelectOverride,
	getItemVariants,
	onChangeItemVariant,
	isDisabled,
} ) => {
	const variants = getItemVariants( selectedItem.wpcom_meta.product_slug );

	if ( variants.length < 2 ) {
		return null;
	}

	return (
		<TermOptions>
			{ variants.map(
				renderProductVariant( selectedItem, onChangeItemVariant, variantSelectOverride, isDisabled )
			) }
		</TermOptions>
	);
};

function renderProductVariant(
	selectedItem: WPCOMCartItem,
	onChangeItemVariant: ( arg0: string, arg1: WPCOMProductSlug, arg2: number ) => void,
	variantSelectOverride: { uuid: string; overrideSelectedProductSlug: string }[],
	isDisabled: boolean
): ( _0: WPCOMProductVariant, _1: number ) => JSX.Element {
	return (
		{ variantLabel, variantDetails, productSlug, productId }: WPCOMProductVariant,
		index: number
	) => {
		const translate = useTranslate();
		const key = index.toString() + productSlug;
		const selectedProductSlug = selectedItem.wpcom_meta.product_slug;

		const isChecked = variantSelectOverride.reduce(
			( accum, { uuid, overrideSelectedProductSlug } ) => {
				return uuid === selectedItem.wpcom_meta.uuid
					? productSlug === overrideSelectedProductSlug
					: accum;
			},
			productSlug === selectedProductSlug
		);

		return (
			<TermOptionsItem key={ key }>
				<RadioButton
					name={ key }
					id={ key }
					value={ productSlug }
					checked={ isChecked }
					isDisabled={ isDisabled }
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
	};
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
