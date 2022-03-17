import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetProductVariants } from '../../hooks/product-variants';
import { ItemVariantPrice } from './variant-price';
import type { ItemVariationPickerProps } from './types';

const VariantLabel = styled.span`
	font-size: ${ ( props ) => props.theme.fontSize.small };
	font-weight: ${ ( props ) => props.theme.weights.normal };
`;

const VariantPrice = styled.span`
	font-size: ${ ( props ) => props.theme.fontSize.small };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	color: #646970;
`;

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
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 10px calc( 14px + 24px + 16px ) 10px 16px;
	cursor: pointer;

	${ ( props ) =>
		props.selected &&
		css`
			background: #055d9c;

			${ VariantLabel }, ${ VariantPrice } {
				color: white;
			}
		` }
`;

const Dropdown = styled.div`
	position: relative;
	width: 100%;
	margin: 20px 0 0;
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
	productSlug,
	selectedItem,
	siteId,
} ) => {
	const translate = useTranslate();
	const variants = useGetProductVariants( siteId, productSlug );

	const [ open, setOpen ] = useState( false );
	const [ highlightedVariantIndex, setHighlightedVariantIndex ] = useState< number | null >( null );

	const selectedVariantIndex = useMemo( () => {
		for ( let i = 0; i < variants.length; ++i ) {
			if ( variants[ i ].productId === selectedItem.product_id ) {
				return i;
			}
		}
		return null;
	}, [ selectedItem.product_id, variants ] );

	// reset the dropdown highlight when the selected product changes
	useEffect( () => {
		setHighlightedVariantIndex( selectedVariantIndex );
	}, [ selectedVariantIndex ] );

	// wrapper around onChangeItemVariant to close up dropdown on change
	const handleChange = useCallback(
		( uuid: string, productSlug: string, productId: number ) => {
			onChangeItemVariant( uuid, productSlug, productId );
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
							variants[ highlightedVariantIndex ].productId
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
				disabled={ isDisabled }
				onClick={ () => setOpen( ! open ) }
				open={ open }
				role="button"
			>
				{ selectedVariantIndex !== null ? (
					<ItemVariantPrice variant={ variants[ selectedVariantIndex ] } />
				) : (
					<span>{ translate( 'Pick a product term' ) }</span>
				) }
				<Gridicon icon={ open ? 'chevron-down' : 'chevron-up' } />
			</CurrentOption>
			{ open && (
				<OptionList role="listbox" tabIndex={ -1 }>
					{ variants.map(
						( { variantLabel, formattedCurrentPrice, productId, productSlug }, index ) => (
							<Option
								id={ productId.toString() }
								role="option"
								key={ productSlug + variantLabel }
								onClick={ () => handleChange( selectedItem.uuid, productSlug, productId ) }
								selected={ index === highlightedVariantIndex }
							>
								<VariantLabel>{ variantLabel }</VariantLabel>
								<VariantPrice>{ formattedCurrentPrice }</VariantPrice>
							</Option>
						)
					) }
				</OptionList>
			) }
		</Dropdown>
	);
};
