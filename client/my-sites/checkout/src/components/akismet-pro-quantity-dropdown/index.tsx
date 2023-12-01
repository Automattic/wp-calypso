import {
	AKISMET_BUSINESS_5K_PRODUCTS,
	PRODUCT_AKISMET_PRO_500_UPGRADE_MAP,
	PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback, useState, useMemo } from 'react';
import type { AkismetProQuantityDropDownProps } from './types';
import type { FunctionComponent } from 'react';

interface CurrentOptionProps {
	open: boolean;
}

const AkismetSitesSelect = styled.div`
	margin-top: 28px;
`;

const AkismetSitesSelectHeading = styled.div`
	font-size: inherit;
	color: ${ ( props ) => props.theme.colors.textColorDark };
	font-weight: ${ ( props ) => props.theme.weights.bold };
`;

const AkismetSitesSelectLabel = styled.div`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	font-size: 14px;
`;

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

const Option = styled.li`
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
	padding: 10px 54px 10px 16px;
	cursor: pointer;

	&:hover {
		background: #e9f0f5;
	}

	&.item-variant-option--selected {
		background: #055d9c;
		color: white;
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

export const AkismetProQuantityDropDown: FunctionComponent< AkismetProQuantityDropDownProps > = ( {
	responseCart,
	setForceShowAkQuantityDropdown,
	onChangeAkProQuantity,
} ) => {
	const translate = useTranslate();

	const [ open, setOpen ] = useState( false );
	const [ selectedQuantity, setSelectedQuantity ] = useState(
		responseCart.products[ 0 ].quantity ?? 1
	);

	const { dropdownOptions, AkBusinessDropdownPosition } = useMemo( () => {
		const dropdownOptions = [
			translate( '1 Site' ),
			translate( '2 Sites' ),
			translate( '3 Sites' ),
			translate( '4 Sites' ),
			translate( 'Unlimited sites (Akismet Business)' ),
		];
		const AkBusinessDropdownPosition = dropdownOptions.length;
		return {
			dropdownOptions,
			AkBusinessDropdownPosition,
		};
	}, [ translate ] );

	const onSitesQuantityChange = useCallback(
		( value: number ) => {
			const { uuid, product_slug, product_id, quantity: prevQuantity } = responseCart.products[ 0 ];
			let productSlug;
			let productId;
			let newQuantity;
			if ( value === AkBusinessDropdownPosition ) {
				// 'Unlimited sites (Akismet Business)' was selected.
				// Replace cart with Akismet Business, quantity null
				productSlug =
					PRODUCT_AKISMET_PRO_500_UPGRADE_MAP[
						product_slug as keyof typeof PRODUCT_AKISMET_PRO_500_UPGRADE_MAP
					].slug;
				productId =
					PRODUCT_AKISMET_PRO_500_UPGRADE_MAP[
						product_slug as keyof typeof PRODUCT_AKISMET_PRO_500_UPGRADE_MAP
					].id;
				newQuantity = null;
				setForceShowAkQuantityDropdown( true );
			} else {
				// 1 - 4 Sites was selected.
				if (
					( AKISMET_BUSINESS_5K_PRODUCTS as ReadonlyArray< string > ).includes( product_slug )
				) {
					// If Akismet Business is in the cart, replace it with Akismet Pro, with the selected quantity.
					productSlug =
						PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP[
							product_slug as keyof typeof PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP
						].slug;
					productId =
						PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP[
							product_slug as keyof typeof PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP
						].id;
					newQuantity = value;
				} else {
					// Akismet Pro, with the seleced quantity.
					productSlug = product_slug;
					productId = product_id;
					newQuantity = value;
				}
				setForceShowAkQuantityDropdown( false );
			}

			setSelectedQuantity( value );
			onChangeAkProQuantity &&
				onChangeAkProQuantity( uuid, productSlug, productId, prevQuantity, newQuantity );
		},
		[
			AkBusinessDropdownPosition,
			onChangeAkProQuantity,
			responseCart.products,
			setForceShowAkQuantityDropdown,
		]
	);

	const adjustedCartQuantity = useMemo( () => {
		if (
			( AKISMET_BUSINESS_5K_PRODUCTS as ReadonlyArray< string > ).includes(
				responseCart.products[ 0 ].product_slug
			)
		) {
			return AkBusinessDropdownPosition;
		}

		return responseCart.products[ 0 ].quantity ?? 1;
	}, [ AkBusinessDropdownPosition, responseCart.products ] );

	useEffect( () => {
		const { product_slug: productSlug, quantity } = responseCart.products[ 0 ];

		setSelectedQuantity( adjustedCartQuantity );

		// Update the product-slug quantity value in the url
		const urlQuantityPart = quantity ? `:-q-${ quantity ?? 1 }` : '';
		const newUrl =
			window.location.protocol +
			'//' +
			window.location.host +
			'/checkout/akismet' +
			`/${ productSlug }` +
			urlQuantityPart +
			window.location.search +
			window.location.hash;
		window.history.replaceState( null, '', newUrl );
	}, [ AkBusinessDropdownPosition, adjustedCartQuantity, responseCart.products ] );

	const selectNextQuantity = useCallback( () => {
		if ( selectedQuantity < dropdownOptions.length ) {
			setSelectedQuantity( selectedQuantity + 1 );
		}
	}, [ selectedQuantity, dropdownOptions.length ] );

	const selectPreviousQuantity = useCallback( () => {
		if ( selectedQuantity > 1 ) {
			setSelectedQuantity( selectedQuantity - 1 );
		}
	}, [ selectedQuantity ] );

	const toggleDropDown = useCallback( () => {
		setOpen( ! open );
	}, [ open ] );

	// arrow keys require onKeyDown for some browsers
	const handleKeyDown: React.KeyboardEventHandler = useCallback(
		( event ) => {
			switch ( event.code ) {
				case 'ArrowDown':
					// prevent browser window from scrolling
					event.preventDefault();
					selectNextQuantity();
					break;
				case 'ArrowUp':
					// prevent browser window from scrolling
					event.preventDefault();
					selectPreviousQuantity();
					break;
				case 'Enter':
					event.preventDefault();
					if ( selectedQuantity !== adjustedCartQuantity ) {
						onSitesQuantityChange( selectedQuantity );
					} else if ( selectedQuantity === adjustedCartQuantity ) {
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
			adjustedCartQuantity,
			onSitesQuantityChange,
			selectNextQuantity,
			selectPreviousQuantity,
			selectedQuantity,
			toggleDropDown,
		]
	);

	return (
		<AkismetSitesSelect>
			<AkismetSitesSelectHeading>{ translate( 'Number of licenses' ) }</AkismetSitesSelectHeading>
			<AkismetSitesSelectLabel>
				{ translate( 'On how many sites do you plan to use Akismet?' ) }
			</AkismetSitesSelectLabel>
			<Dropdown aria-expanded={ open } aria-haspopup="listbox" onKeyDown={ handleKeyDown }>
				<CurrentOption
					aria-label={ translate( 'Pick the number of sites you plan to use Akismet?' ) }
					onClick={ () => setOpen( ! open ) }
					open={ open }
					role="button"
				>
					{ dropdownOptions[ selectedQuantity - 1 ] }
					<Gridicon icon={ open ? 'chevron-up' : 'chevron-down' } />
				</CurrentOption>
				{ open && (
					<OptionList role="listbox" tabIndex={ -1 }>
						{ dropdownOptions.map( ( option, index ) => (
							<Option
								key={ `quantity-${ index + 1 }` }
								className={
									index + 1 === selectedQuantity ? 'item-variant-option--selected' : undefined
								}
								role="option"
								aria-selected={ index + 1 === selectedQuantity }
								onClick={ () => onSitesQuantityChange( index + 1 ) }
							>
								{ option }
							</Option>
						) ) }
					</OptionList>
				) }
			</Dropdown>
		</AkismetSitesSelect>
	);
};

export * from './types';
