import { isMultiYearDomainProduct } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { ItemVariantDropDownPrice } from './variant-dropdown-price';
import type { ItemVariationPickerProps, WPCOMProductVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

interface CurrentOptionProps {
	open: boolean;
}

const CurrentOption = styled.button< CurrentOptionProps >`
	align-items: center;
	background: white;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	border-radius: 3px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 14px 16px;
	width: 100%;
	cursor: pointer;

	.gridicon {
		fill: #a7aaad;
		margin-left: 14px;
	}

	${ ( props ) =>
		props.open &&
		css`
			border-radius: 3px 3px 0 0;
		` }
`;

interface OptionProps {
	selected: boolean;
}

const Option = styled.li< OptionProps >`
	align-items: center;
	background: white;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	color: #646970;
	display: flex;
	flex-direction: row;
	font-size: ${ ( props ) => props.theme.fontSize.small };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	justify-content: space-between;
	/* the calc aligns the price with the price in CurrentOption */
	padding: 10px calc( 14px + 24px + 16px ) 10px 16px;
	cursor: pointer;

	&:hover {
		background: #e9f0f5;
	}

	&.item-variant-option--selected {
		background: #055d9c;
	}
`;

const Dropdown = styled.div`
	position: relative;
	width: 100%;
	margin: 16px 0;
	> ${ Option } {
		border-radius: 3px;
	}
`;

const OptionList = styled.ul`
	position: absolute;
	width: 100%;
	z-index: 1;
	margin: 0;

	${ Option } {
		margin-top: -1px;

		&:last-child {
			border-bottom-left-radius: 3px;
			border-bottom-right-radius: 3px;
		}
	}
`;

export const ItemVariationDropDown: FunctionComponent< ItemVariationPickerProps > = ( {
	isDisabled,
	onChangeItemVariant,
	selectedItem,
	variants,
} ) => {
	const translate = useTranslate();

	const [ open, setOpen ] = useState( false );
	const [ highlightedVariantIndex, setHighlightedVariantIndex ] = useState< number | null >( null );

	// Multi-year domain products must be compared by volume because they have the same product id.
	const selectedVariantIndexRaw = variants.findIndex( ( variant ) =>
		isMultiYearDomainProduct( selectedItem )
			? selectedItem.volume === variant.volume
			: selectedItem.product_id === variant.productId
	);
	// findIndex returns -1 if it fails and we want null.
	const selectedVariantIndex = selectedVariantIndexRaw > -1 ? selectedVariantIndexRaw : null;

	// reset the dropdown highlight when the selected product changes
	useEffect( () => {
		setHighlightedVariantIndex( selectedVariantIndex );
	}, [ selectedVariantIndex ] );

	// wrapper around onChangeItemVariant to close up dropdown on change
	const handleChange = useCallback(
		( uuid: string, productSlug: string, productId: number, volume?: number ) => {
			onChangeItemVariant( uuid, productSlug, productId, volume );
			setOpen( false );
		},
		[ onChangeItemVariant ]
	);

	const selectNextVariant = useCallback( () => {
		if ( highlightedVariantIndex !== null && highlightedVariantIndex < variants.length - 1 ) {
			setHighlightedVariantIndex( highlightedVariantIndex + 1 );
		}
	}, [ highlightedVariantIndex, variants.length ] );

	const selectPreviousVariant = useCallback( () => {
		if ( highlightedVariantIndex !== null && highlightedVariantIndex > 0 ) {
			setHighlightedVariantIndex( highlightedVariantIndex - 1 );
		}
	}, [ highlightedVariantIndex ] );

	// reset highlight when dropdown is closed
	const toggleDropDown = useCallback( () => {
		setOpen( ! open );
		setHighlightedVariantIndex( selectedVariantIndex );
	}, [ open, selectedVariantIndex ] );

	// arrow keys require onKeyDown for some browsers
	const handleKeyDown: React.KeyboardEventHandler = useCallback(
		( event ) => {
			switch ( event.code ) {
				case 'ArrowDown':
					// prevent browser window from scrolling
					event.preventDefault();
					selectNextVariant();
					break;
				case 'ArrowUp':
					// prevent browser window from scrolling
					event.preventDefault();
					selectPreviousVariant();
					break;
				case 'Enter':
					event.preventDefault();
					if (
						highlightedVariantIndex !== null &&
						highlightedVariantIndex !== selectedVariantIndex
					) {
						handleChange(
							selectedItem.uuid,
							variants[ highlightedVariantIndex ].productSlug,
							variants[ highlightedVariantIndex ].productId,
							variants[ highlightedVariantIndex ].volume
						);
					} else if ( highlightedVariantIndex === selectedVariantIndex ) {
						toggleDropDown();
					}
					break;
				case 'Space':
					event.preventDefault();
					toggleDropDown();
					break;
			}
		},
		[
			handleChange,
			highlightedVariantIndex,
			selectedItem.uuid,
			selectedVariantIndex,
			selectNextVariant,
			selectPreviousVariant,
			toggleDropDown,
			variants,
		]
	);

	if ( variants.length < 2 ) {
		return null;
	}

	return (
		<Dropdown aria-expanded={ open } aria-haspopup="listbox" onKeyDown={ handleKeyDown }>
			<CurrentOption
				aria-label={ translate( 'Pick a product term' ) }
				disabled={ isDisabled }
				onClick={ () => setOpen( ! open ) }
				open={ open }
				role="button"
			>
				{ selectedVariantIndex !== null ? (
					<ItemVariantDropDownPrice variant={ variants[ selectedVariantIndex ] } />
				) : (
					<span>{ translate( 'Pick a product term' ) }</span>
				) }
				<Gridicon icon={ open ? 'chevron-up' : 'chevron-down' } />
			</CurrentOption>
			{ open && (
				<ItemVariantOptionList
					variants={ variants }
					highlightedVariantIndex={ highlightedVariantIndex }
					selectedItem={ selectedItem }
					handleChange={ handleChange }
				/>
			) }
		</Dropdown>
	);
};

function ItemVariantOptionList( {
	variants,
	highlightedVariantIndex,
	selectedItem,
	handleChange,
}: {
	variants: WPCOMProductVariant[];
	highlightedVariantIndex: number | null;
	selectedItem: ResponseCartProduct;
	handleChange: ( uuid: string, productSlug: string, productId: number, volume?: number ) => void;
} ) {
	const compareTo = variants.find( ( variant ) => variant.productId === selectedItem.product_id );
	return (
		<OptionList role="listbox" tabIndex={ -1 }>
			{ variants.map( ( variant, index ) => (
				<ItemVariantOption
					key={ variant.productSlug + variant.variantLabel }
					isSelected={ index === highlightedVariantIndex }
					onSelect={ () =>
						handleChange(
							selectedItem.uuid,
							variant.productSlug,
							variant.productId,
							variant.volume
						)
					}
					compareTo={ compareTo }
					variant={ variant }
				/>
			) ) }
		</OptionList>
	);
}

function ItemVariantOption( {
	isSelected,
	onSelect,
	compareTo,
	variant,
}: {
	isSelected: boolean;
	onSelect: () => void;
	compareTo?: WPCOMProductVariant;
	variant: WPCOMProductVariant;
} ) {
	const { variantLabel, productId, productSlug } = variant;
	return (
		<Option
			id={ productId.toString() }
			className={ isSelected ? 'item-variant-option--selected' : undefined }
			aria-label={ variantLabel }
			data-product-slug={ productSlug }
			role="option"
			onClick={ onSelect }
			selected={ isSelected }
		>
			<ItemVariantDropDownPrice variant={ variant } compareTo={ compareTo } />
		</Option>
	);
}
