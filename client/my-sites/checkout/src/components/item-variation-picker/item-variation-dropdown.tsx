import {
	isJetpackPlan,
	isJetpackProduct,
	isMultiYearDomainProduct,
	isWpComPlan,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import {
	useStreamlinedPriceExperiment,
	isStreamlinedPriceDropdownTreatment,
} from 'calypso/my-sites/plans-features-main/hooks/use-streamlined-price-experiment';
import { JetpackItemVariantDropDownPrice } from './jetpack-variant-dropdown-price';
import { CurrentOption, Dropdown, OptionList, Option, WPCheckoutCheckIcon } from './styles';
import { ItemVariantDropDownPrice } from './variant-dropdown-price';
import type { ItemVariationPickerProps, WPCOMProductVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

const isJetpack = ( variant: WPCOMProductVariant ) =>
	isJetpackProduct( variant ) || isJetpackPlan( variant );

export const ItemVariationDropDown: FunctionComponent< ItemVariationPickerProps > = ( {
	id,
	isDisabled,
	onChangeItemVariant,
	selectedItem,
	variants,
	toggle,
	isOpen,
} ) => {
	const translate = useTranslate();
	const [ highlightedVariantIndex, setHighlightedVariantIndex ] = useState< number | null >( null );
	const [ , streamlinedPriceExperimentAssignment ] = useStreamlinedPriceExperiment();
	const isStreamlinedPrice =
		isStreamlinedPriceDropdownTreatment( streamlinedPriceExperimentAssignment ) &&
		isWpComPlan( selectedItem.product_slug );

	const [ optimisticSelectedItem, setOptimisticSelectedItem ] = useState< string | null >( null );

	useEffect( () => {
		if ( isStreamlinedPrice ) {
			setOptimisticSelectedItem( selectedItem.product_slug );
		}
	}, [ selectedItem.product_slug, isStreamlinedPrice ] );

	// Multi-year domain products must be compared by volume because they have the same product id.
	const selectedVariantIndex = useMemo( () => {
		const rawIndex = variants.findIndex( ( variant ) => {
			if ( isStreamlinedPrice && optimisticSelectedItem ) {
				return variant.productSlug === optimisticSelectedItem;
			}
			// If not optimistic, or optimisticSelectedItem is not set, use the original logic
			return isMultiYearDomainProduct( selectedItem )
				? selectedItem.volume === variant.volume && variant.productId === selectedItem.product_id
				: selectedItem.product_id === variant.productId;
		} );
		return rawIndex > -1 ? rawIndex : null;
	}, [ variants, isStreamlinedPrice, optimisticSelectedItem, selectedItem ] );

	// reset the dropdown highlight when the selected product changes
	useEffect( () => {
		setHighlightedVariantIndex( selectedVariantIndex );
	}, [ selectedVariantIndex ] );

	// wrapper around onChangeItemVariant to close up dropdown on change
	const handleChange = useCallback(
		( uuid: string, productSlug: string, productId: number, volume?: number ) => {
			if ( isStreamlinedPrice ) {
				setOptimisticSelectedItem( productSlug );
			}
			onChangeItemVariant( uuid, productSlug, productId, volume );
			toggle( null );
		},
		[ onChangeItemVariant, toggle, isStreamlinedPrice ]
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
		toggle( id );
		setHighlightedVariantIndex( selectedVariantIndex );
	}, [ id, selectedVariantIndex, toggle ] );

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

	let compareTo = undefined;
	if ( isStreamlinedPrice ) {
		compareTo = variants[ 0 ];
	}
	const ItemVariantDropDownPriceWrapper: FunctionComponent< { variant: WPCOMProductVariant } > = (
		props
	) =>
		isJetpack( props.variant ) ? (
			<JetpackItemVariantDropDownPrice { ...props } allVariants={ variants } />
		) : (
			<ItemVariantDropDownPrice
				{ ...props }
				product={ selectedItem }
				isStreamlinedPrice={ isStreamlinedPrice }
				compareTo={ compareTo }
			/>
		);

	return (
		<Dropdown
			className={ isJetpackCheckout() ? 'is-jetpack' : '' }
			aria-expanded={ isOpen }
			aria-haspopup="listbox"
			onKeyDown={ handleKeyDown }
		>
			<CurrentOption
				aria-label={ translate( 'Pick a product term' ) }
				disabled={ isDisabled }
				onClick={ () => toggle( id ) }
				open={ isOpen }
				role="button"
				detached={ isStreamlinedPrice }
			>
				{ selectedVariantIndex !== null ? (
					<ItemVariantDropDownPriceWrapper variant={ variants[ selectedVariantIndex ] } />
				) : (
					<span>{ translate( 'Pick a product term' ) }</span>
				) }
				<Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } />
			</CurrentOption>
			{ isOpen && (
				<ItemVariantOptionList
					variants={ variants }
					highlightedVariantIndex={ highlightedVariantIndex }
					selectedItem={ selectedItem }
					handleChange={ handleChange }
					isStreamlinedPrice={ isStreamlinedPrice }
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
	isStreamlinedPrice,
}: {
	variants: WPCOMProductVariant[];
	highlightedVariantIndex: number | null;
	selectedItem: ResponseCartProduct;
	handleChange: ( uuid: string, productSlug: string, productId: number, volume?: number ) => void;
	isStreamlinedPrice: boolean;
} ) {
	const compareTo = isStreamlinedPrice
		? variants[ 0 ]
		: variants.find( ( variant ) => variant.productId === selectedItem.product_id );
	return (
		<OptionList role="listbox" tabIndex={ -1 } detached={ isStreamlinedPrice }>
			{ variants.map( ( variant, index ) => (
				<ItemVariantOption
					key={ variant.productSlug + variant.variantLabel.noun }
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
					allVariants={ variants }
					selectedItem={ selectedItem }
					isStreamlinedPrice={ isStreamlinedPrice }
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
	allVariants,
	selectedItem,
	isStreamlinedPrice,
}: {
	isSelected: boolean;
	onSelect: () => void;
	compareTo?: WPCOMProductVariant;
	variant: WPCOMProductVariant;
	allVariants: WPCOMProductVariant[];
	selectedItem: ResponseCartProduct;
	isStreamlinedPrice: boolean;
} ) {
	const { variantLabel, productId, productSlug } = variant;
	return (
		<Option
			id={ productId.toString() }
			className={ isSelected ? 'item-variant-option--selected' : undefined }
			aria-label={ variantLabel.noun }
			data-product-slug={ productSlug }
			role="option"
			onClick={ onSelect }
			selected={ isSelected }
			detached={ isStreamlinedPrice }
		>
			{ isJetpack( variant ) ? (
				<JetpackItemVariantDropDownPrice variant={ variant } allVariants={ allVariants } />
			) : (
				<ItemVariantDropDownPrice
					variant={ variant }
					compareTo={ compareTo }
					product={ selectedItem }
					isStreamlinedPrice={ isStreamlinedPrice }
				/>
			) }
			{ isStreamlinedPrice && isSelected && <WPCheckoutCheckIcon /> }
		</Option>
	);
}
