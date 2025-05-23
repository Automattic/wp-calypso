import {
	AKISMET_BUSINESS_5K_PRODUCTS,
	PRODUCT_AKISMET_PRO_500_UPGRADE_MAP,
	PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { isMobile } from '@automattic/viewport';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
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
		background: var( --studio-wordpress-blue-5 );
	}

	&.item-variant-option--selected {
		background: var( --studio-wordpress-blue-50 );
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
	z-index: 4;
	margin: 0;
	box-shadow: rgba( 0, 0, 0, 0.16 ) 0px 1px 4px;

	${ Option } {
		margin-top: -1px;

		&:last-child {
			border-bottom-left-radius: 3px;
			border-bottom-right-radius: 3px;
		}
	}
`;

const CurrentOptionContainer = styled.div`
	align-items: center;
	display: flex;
	font-size: ${ ( props ) => props.theme.fontSize.small };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	justify-content: space-between;
	flex-wrap: wrap;
	line-height: 20px;
	width: 100%;
	column-gap: 20px;
	text-align: left;
`;

const Price = styled.span`
	flex: 1 0 fit-content;
	color: #646970;
	text-align: start;

	> span {
		font-size: calc( ${ ( props ) => props.theme.fontSize.small } - 1px );
	}

	@media ( ${ ( props ) => props.theme.breakpoints.bigPhoneUp } ) {
		text-align: end;
	}
`;

export const AkismetProQuantityDropDown: FunctionComponent< AkismetProQuantityDropDownProps > = ( {
	id,
	responseCart,
	setForceShowAkQuantityDropdown,
	onChangeAkProQuantity,
	toggle,
	isOpen,
} ) => {
	const translate = useTranslate();
	const { dropdownOptions, AkBusinessDropdownPosition } = useMemo( () => {
		const dropdownOptions = [
			preventWidows( translate( '1 Site' ) ),
			preventWidows( translate( '2 Sites' ) ),
			preventWidows( translate( '3 Sites' ) ),
			preventWidows( translate( '4 Sites' ) ),
			preventWidows( translate( 'Unlimited sites (Akismet Business)' ) ),
		];
		const AkBusinessDropdownPosition = dropdownOptions.length;
		return {
			dropdownOptions,
			AkBusinessDropdownPosition,
		};
	}, [ translate ] );

	const { validatedCartQuantity, validatedDropdownQuantity } = useMemo( () => {
		const { product_slug, quantity } = responseCart.products[ 0 ];
		let validatedCartQuantity = quantity;
		let validatedDropdownQuantity = quantity ?? 1;
		if ( ( AKISMET_BUSINESS_5K_PRODUCTS as ReadonlyArray< string > ).includes( product_slug ) ) {
			validatedCartQuantity = null;
			validatedDropdownQuantity = AkBusinessDropdownPosition;
		} else if ( quantity == null || quantity < 1 ) {
			validatedCartQuantity = 1;
			validatedDropdownQuantity = 1;
		} else if ( quantity && quantity > dropdownOptions.length - 1 ) {
			validatedCartQuantity = dropdownOptions.length - 1;
			validatedDropdownQuantity = dropdownOptions.length - 1;
		} else if ( quantity ) {
			validatedCartQuantity = quantity;
			validatedDropdownQuantity = quantity;
		}
		return {
			validatedCartQuantity,
			validatedDropdownQuantity,
		};
	}, [ AkBusinessDropdownPosition, dropdownOptions.length, responseCart.products ] );

	const [ selectedQuantity, setSelectedQuantity ] = useState( validatedDropdownQuantity );

	const onSitesQuantityChange = useCallback(
		( value: number ) => {
			const {
				uuid: cartProductUuid,
				product_slug: cartProductSlug,
				product_id: cartProductId,
				quantity: prevQuantity,
			} = responseCart.products[ 0 ];
			let newProductSlug;
			let newProductId;
			let newQuantity;
			if ( value === AkBusinessDropdownPosition ) {
				// 'Unlimited sites (Akismet Business)' was selected.
				// Replace cart with Akismet Business, quantity: null
				newProductSlug =
					PRODUCT_AKISMET_PRO_500_UPGRADE_MAP[
						cartProductSlug as keyof typeof PRODUCT_AKISMET_PRO_500_UPGRADE_MAP
					].slug;
				newProductId =
					PRODUCT_AKISMET_PRO_500_UPGRADE_MAP[
						cartProductSlug as keyof typeof PRODUCT_AKISMET_PRO_500_UPGRADE_MAP
					].id;
				newQuantity = null;
				setForceShowAkQuantityDropdown( true );
			} else {
				// 1 - 4 Sites was selected.
				// eslint-disable-next-line no-lonely-if
				if (
					( AKISMET_BUSINESS_5K_PRODUCTS as ReadonlyArray< string > ).includes( cartProductSlug )
				) {
					// If Akismet Business is in the cart, replace it with Akismet Pro, with the selected quantity.
					newProductSlug =
						PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP[
							cartProductSlug as keyof typeof PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP
						].slug;
					newProductId =
						PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP[
							cartProductSlug as keyof typeof PRODUCT_AKISMET_BUSINESS_5K_DOWNGRADE_MAP
						].id;
					newQuantity = value;
				} else {
					// Akismet Pro, with the seleced quantity.
					newProductSlug = cartProductSlug;
					newProductId = cartProductId;
					newQuantity = value;
				}
			}

			setSelectedQuantity( value );
			onChangeAkProQuantity(
				cartProductUuid,
				newProductSlug,
				newProductId,
				prevQuantity,
				newQuantity
			);
		},
		[
			AkBusinessDropdownPosition,
			onChangeAkProQuantity,
			responseCart.products,
			setForceShowAkQuantityDropdown,
		]
	);

	useEffect( () => {
		// When the cart changes, update the dropdown and the url.
		const { uuid, product_slug, product_id, quantity } = responseCart.products[ 0 ];

		// only allow valid quantity in cart (1 - 4 || null)
		if ( quantity !== validatedCartQuantity ) {
			onChangeAkProQuantity( uuid, product_slug, product_id, quantity, validatedCartQuantity );
		}

		setSelectedQuantity( validatedDropdownQuantity );

		// Update the product-slug quantity value in the url
		const urlQuantityPart = quantity ? `:-q-${ quantity ?? 1 }` : '';
		const newUrl =
			window.location.protocol +
			'//' +
			window.location.host +
			'/checkout/akismet' +
			`/${ product_slug }` +
			urlQuantityPart +
			window.location.search +
			window.location.hash;
		window.history.replaceState( null, '', newUrl );
	}, [
		onChangeAkProQuantity,
		responseCart.products,
		validatedCartQuantity,
		validatedDropdownQuantity,
	] );

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
					if ( selectedQuantity !== validatedDropdownQuantity ) {
						onSitesQuantityChange( selectedQuantity );
					} else if ( selectedQuantity === validatedDropdownQuantity ) {
						toggle( id );
					}
					break;
				case 'Space':
					event.preventDefault();
					toggle( id );
					break;
			}
		},
		[
			validatedDropdownQuantity,
			onSitesQuantityChange,
			selectNextQuantity,
			selectPreviousQuantity,
			selectedQuantity,
			toggle,
			id,
		]
	);

	const { quantity, currency, item_subtotal_integer } = responseCart.products[ 0 ];
	const itemSubtotalQuantityOneInteger = item_subtotal_integer / ( quantity ?? 1 );

	const actualAmountQuantityOneDisplay = formatCurrency( itemSubtotalQuantityOneInteger, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	const actualAmountDisplay = formatCurrency( item_subtotal_integer, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	const getCurrentOptionPriceDisplay = useCallback( () => {
		if ( selectedQuantity !== AkBusinessDropdownPosition ) {
			return isMobile()
				? translate(
						'{{span}}%(quantity)d licenses @ %(actualAmountQuantityOneDisplay)s/ea. = %(actualAmountDisplay)s{{/span}}',
						{
							args: {
								quantity: selectedQuantity,
								actualAmountQuantityOneDisplay,
								actualAmountDisplay,
							},
							components: {
								span: <span />,
							},
							comment: `
								%(quantity) is the number of product licenses being purchased, e.g. "3 licenses".
								%(actualAmountQuantityOneDisplay)s is the localized price for 1 license, e.g. "$10.25".
								%(actualAmountDisplay)s is the localized total price, e.g. "$30.75".
							`,
						}
				  )
				: translate(
						'{{span}}%(quantity)d licenses @ %(actualAmountQuantityOneDisplay)s per license = %(actualAmountDisplay)s{{/span}}',
						{
							args: {
								quantity: selectedQuantity,
								actualAmountQuantityOneDisplay,
								actualAmountDisplay,
							},
							components: {
								span: <span />,
							},
							comment: `
								%(quantity) is the number of product licenses being purchased, e.g. "3 licenses".
								%(actualAmountQuantityOneDisplay)s is the localized price for 1 license, e.g. "$10.25".
								%(actualAmountDisplay)s is the localized total price, e.g. "$30.75".
							`,
						}
				  );
		}

		return actualAmountDisplay;
	}, [
		AkBusinessDropdownPosition,
		actualAmountDisplay,
		actualAmountQuantityOneDisplay,
		translate,
		selectedQuantity,
	] );

	return (
		<AkismetSitesSelect>
			<AkismetSitesSelectHeading>{ translate( 'Number of licenses' ) }</AkismetSitesSelectHeading>
			<AkismetSitesSelectLabel>
				{ translate( 'On how many sites do you plan to use Akismet?' ) }
			</AkismetSitesSelectLabel>
			<Dropdown aria-expanded={ isOpen } aria-haspopup="listbox" onKeyDown={ handleKeyDown }>
				<CurrentOption
					aria-label={ translate( 'Pick the number of sites you plan to use Akismet?' ) }
					onClick={ () => toggle( id ) }
					open={ isOpen }
					role="button"
				>
					<CurrentOptionContainer>
						<span>{ dropdownOptions[ selectedQuantity - 1 ] }</span>
						<Price>{ getCurrentOptionPriceDisplay() }</Price>
					</CurrentOptionContainer>
					<Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } />
				</CurrentOption>
				{ isOpen && (
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
