import colorStudio from '@automattic/color-studio';
import { formatCurrency } from '@automattic/number-formatters';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import {
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ForwardedRef,
	type FunctionComponent,
	type KeyboardEvent,
} from 'react';
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
	tabIndex: number;
}

const ButtonTile = forwardRef(
	(
		{
			productVariant,
			selectedItem,
			onChangeItemVariant,
			isDisabled,
			compareTo,
			isActive,
			tabIndex,
		}: TileProps,
		ref: ForwardedRef< HTMLButtonElement >
	) => {
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
				ref={ ref }
				type="button"
				role="radio"
				aria-checked={ isActive }
				active={ isActive }
				disabled={ isDisabled }
				tabIndex={ tabIndex }
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
					{ translate( '%(pricePerMonth)s/mo', {
						args: { pricePerMonth: pricePerMonthFormatted },
					} ) }
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
	}
);

ButtonTile.displayName = 'ButtonTile';

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
	const tileRefs = useRef< Array< HTMLButtonElement | null > >( [] );

	useEffect( () => {
		setOptimisticSelectedItem( selectedItem.product_slug );
	}, [ selectedItem ] );

	const selectedIndex = variants.findIndex(
		( variant ) => variant.productSlug === optimisticSelectedItem
	);

	const handleChange: OnChangeItemVariant = useCallback(
		( uuid, productSlug, productId, volume ) => {
			setOptimisticSelectedItem( productSlug );
			onChangeItemVariant( uuid, productSlug, productId, volume );
		},
		[ onChangeItemVariant ]
	);

	const moveSelection = useCallback(
		( newIndex: number ) => {
			const variant = variants[ newIndex ];
			if ( ! variant ) {
				return;
			}
			tileRefs.current[ newIndex ]?.focus();
			if ( variant.productSlug !== optimisticSelectedItem ) {
				handleChange( selectedItem.uuid, variant.productSlug, variant.productId, variant.volume );
			}
		},
		[ variants, optimisticSelectedItem, selectedItem.uuid, handleChange ]
	);

	const handleKeyDown = useCallback(
		( event: KeyboardEvent< HTMLDivElement > ) => {
			if ( isDisabled ) {
				return;
			}
			const last = variants.length - 1;
			const current = selectedIndex >= 0 ? selectedIndex : 0;
			let next: number | null = null;
			switch ( event.key ) {
				case 'ArrowRight':
				case 'ArrowDown':
					next = current === last ? 0 : current + 1;
					break;
				case 'ArrowLeft':
				case 'ArrowUp':
					next = current === 0 ? last : current - 1;
					break;
				case 'Home':
					next = 0;
					break;
				case 'End':
					next = last;
					break;
			}
			if ( next !== null ) {
				event.preventDefault();
				moveSelection( next );
			}
		},
		[ isDisabled, variants.length, selectedIndex, moveSelection ]
	);

	if ( variants.length < 2 ) {
		return null;
	}

	const compareTo = variants[ 0 ];
	// If nothing matches the cart's selected slug, make the first tile the
	// keyboard entry point so the radiogroup is still focusable.
	const focusableIndex = selectedIndex >= 0 ? selectedIndex : 0;

	return (
		<Row
			role="radiogroup"
			aria-label={ translate( 'Pick a product term' ) }
			className="item-variation-picker"
			count={ variants.length }
			onKeyDown={ handleKeyDown }
		>
			{ variants.map( ( variant, index ) => (
				<ButtonTile
					key={ variant.productSlug + variant.variantLabel.noun }
					ref={ ( el ) => {
						tileRefs.current[ index ] = el;
					} }
					productVariant={ variant }
					selectedItem={ selectedItem }
					onChangeItemVariant={ handleChange }
					isDisabled={ isDisabled }
					compareTo={ compareTo }
					isActive={ variant.productSlug === optimisticSelectedItem }
					tabIndex={ index === focusableIndex ? 0 : -1 }
				/>
			) ) }
		</Row>
	);
};
