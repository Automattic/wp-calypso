import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback, useState } from 'react';
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
	onChangeAkProQuantity,
} ) => {
	const translate = useTranslate();

	const [ open, setOpen ] = useState( false );
	const [ selectedQuantity, setSelectedQuantity ] = useState(
		responseCart.products[ 0 ].quantity ?? 1
	);

	const dropdownOptions = [ 1, 2, 3, 4 ];

	const onSitesQuantityChange = useCallback(
		( value: number ) => {
			const newQuantity = value || 1;
			const {
				uuid,
				product_slug: productSlug,
				product_id: productId,
				quantity: prevQuantity,
			} = responseCart.products[ 0 ];
			setSelectedQuantity( newQuantity );
			onChangeAkProQuantity &&
				onChangeAkProQuantity( uuid, productSlug, productId, prevQuantity, newQuantity );
		},
		[ onChangeAkProQuantity, responseCart.products ]
	);

	useEffect( () => {
		const { product_slug: productSlug, quantity } = responseCart.products[ 0 ];
		setSelectedQuantity( quantity ?? 1 );

		// Update the product-slug quantity value in the url
		const urlQuantityPart = `:-q-${ quantity ?? 1 }`;
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
	}, [ responseCart.products ] );

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

	// reset highlight when dropdown is closed
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
					if ( selectedQuantity !== responseCart.products[ 0 ].quantity ?? 1 ) {
						onSitesQuantityChange( selectedQuantity );
					} else if ( selectedQuantity === responseCart.products[ 0 ].quantity ?? 1 ) {
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
			onSitesQuantityChange,
			responseCart.products,
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
					{ translate( '%(count)d Site', '%(count)d Sites', {
						count: selectedQuantity,
						args: {
							count: selectedQuantity,
						},
					} ) }
					<Gridicon icon={ open ? 'chevron-up' : 'chevron-down' } />
				</CurrentOption>
				{ open && (
					<OptionList role="listbox" tabIndex={ -1 }>
						{ dropdownOptions.map( ( value ) => (
							<Option
								key={ `quantity-${ value }` }
								className={
									value === selectedQuantity ? 'item-variant-option--selected' : undefined
								}
								role="option"
								aria-selected={ value === selectedQuantity }
								onClick={ () => onSitesQuantityChange( value ) }
							>
								{ translate( '%(count)d Site', '%(count)d Sites', {
									count: value,
									args: {
										count: value,
									},
								} ) }
							</Option>
						) ) }
					</OptionList>
				) }
			</Dropdown>
		</AkismetSitesSelect>
	);
};

export * from './types';
