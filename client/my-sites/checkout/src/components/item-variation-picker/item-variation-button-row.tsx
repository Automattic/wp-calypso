import colorStudio from '@automattic/color-studio';
import { formatCurrency } from '@automattic/number-formatters';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, type FunctionComponent } from 'react';
import { getItemVariantDiscount } from './util';
import type { ItemVariationPickerProps, WPCOMProductVariant, OnChangeItemVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

const Row = styled.div< { count: number } >`
	display: grid;
	grid-template-columns: repeat( ${ ( props ) => props.count }, minmax( 0, 1fr ) );
	gap: 10px;
	margin: 16px 0;
	width: 100%;
`;

const Tile = styled.button< { active: boolean } >`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: center;
	gap: 6px;
	padding: ${ ( props ) => ( props.active ? '15px 12px' : '16px 13px' ) };
	border: ${ ( props ) =>
		props.active
			? `2px solid ${ colorStudio.colors[ 'Blue 50' ] }`
			: `1px solid ${ colorStudio.colors[ 'Gray 5' ] }` };
	border-radius: 3px;
	background: #fff;
	cursor: pointer;
	font: inherit;

	&:disabled {
		cursor: default;
		opacity: 0.5;
	}

	&:focus-visible {
		outline: 2px solid ${ colorStudio.colors[ 'Blue 50' ] };
		outline-offset: 2px;
	}
`;

const Label = styled.span`
	font-size: 15px;
	font-weight: 500;
	line-height: 20px;
	color: ${ colorStudio.colors[ 'Black' ] };
	text-align: start;
`;

const Price = styled.span`
	font-size: 15px;
	font-weight: 500;
	line-height: 20px;
	font-variant-numeric: tabular-nums;
	color: ${ colorStudio.colors[ 'Black' ] };
	text-align: start;
`;

const PriceSuffix = styled.span`
	color: ${ colorStudio.colors[ 'Gray 60' ] };
`;

const SavePill = styled.span`
	align-self: flex-start;
	width: fit-content;
	font-size: 11px;
	font-weight: 500;
	line-height: 16px;
	color: ${ colorStudio.colors[ 'Green 80' ] };
	background: ${ colorStudio.colors[ 'Green 5' ] };
	padding: 1px 7px;
	border-radius: 3px;
	white-space: nowrap;
`;

const SavePillPlaceholder = styled.span`
	align-self: flex-start;
	width: fit-content;
	font-size: 11px;
	line-height: 16px;
	padding: 1px 7px;
	visibility: hidden;
`;

interface TileProps {
	productVariant: WPCOMProductVariant;
	selectedItem: ResponseCartProduct;
	onChangeItemVariant: OnChangeItemVariant;
	isDisabled: boolean;
	compareTo?: WPCOMProductVariant;
	isActive: boolean;
}

const ButtonTile: FunctionComponent< TileProps > = ( {
	productVariant,
	selectedItem,
	onChangeItemVariant,
	isDisabled,
	compareTo,
	isActive,
} ) => {
	const translate = useTranslate();
	const { variantLabel, productSlug, productId, termIntervalInMonths } = productVariant;

	let priceTermIntervalInMonths = termIntervalInMonths;
	if ( productVariant.introductoryTerm === 'month' ) {
		priceTermIntervalInMonths = productVariant.introductoryInterval ?? 1;
	}
	const pricePerMonth = Math.round( productVariant.priceInteger / priceTermIntervalInMonths );
	const pricePerMonthFormatted = formatCurrency( pricePerMonth, productVariant.currency, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	const label = termIntervalInMonths === 1 ? translate( 'Month' ) : variantLabel.noun;
	const discountPercentage = getItemVariantDiscount( productVariant, compareTo );

	return (
		<Tile
			type="button"
			role="radio"
			aria-checked={ isActive }
			active={ isActive }
			disabled={ isDisabled }
			data-product-slug={ productSlug }
			onClick={ () => {
				if ( isDisabled || isActive ) {
					return;
				}
				onChangeItemVariant( selectedItem.uuid, productSlug, productId );
			} }
		>
			<Label>{ label }</Label>
			<Price>
				{ pricePerMonthFormatted }
				<PriceSuffix>{ translate( '/mo' ) }</PriceSuffix>
			</Price>
			{ discountPercentage > 0 ? (
				<SavePill>
					{ translate( 'Save %(percent)s%%', {
						args: { percent: discountPercentage },
					} ) }
				</SavePill>
			) : (
				<SavePillPlaceholder aria-hidden="true">&nbsp;</SavePillPlaceholder>
			) }
		</Tile>
	);
};

export const ItemVariationButtonRow: FunctionComponent< ItemVariationPickerProps > = ( {
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

	const handleChange: OnChangeItemVariant = ( uuid, productSlug, productId, volume ) => {
		setOptimisticSelectedItem( productSlug );
		onChangeItemVariant( uuid, productSlug, productId, volume );
	};

	return (
		<Row
			role="radiogroup"
			aria-label={ translate( 'Pick a product term' ) }
			className="item-variation-picker"
			count={ variants.length }
		>
			{ variants.map( ( variant ) => (
				<ButtonTile
					key={ variant.productSlug + variant.variantLabel.noun }
					productVariant={ variant }
					selectedItem={ selectedItem }
					onChangeItemVariant={ handleChange }
					isDisabled={ isDisabled }
					compareTo={ compareTo }
					isActive={ variant.productSlug === optimisticSelectedItem }
				/>
			) ) }
		</Row>
	);
};
