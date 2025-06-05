import { FormLabel } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { MenuGroup, MenuItem, ToolbarDropdownMenu } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, chevronDown, close } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { ChangeEvent, MouseEvent, MouseEventHandler, useState } from 'react';
import QueryMemberships from 'calypso/components/data/query-memberships';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { COUPON_PRODUCTS_ANY } from 'calypso/my-sites/earn/memberships/constants';
import { Product } from 'calypso/my-sites/earn/types';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type ProductsSelectorProps = {
	onSelectedPlanIdsChange: ( ids_list: number[] ) => void;
	initialSelectedList: number[];
	allowMultiple: boolean;
};

const ProductsSelector = ( {
	onSelectedPlanIdsChange,
	initialSelectedList,
	allowMultiple,
}: ProductsSelectorProps ) => {
	const [ selectedPlanIds, setSelectedPlanIds ] = useState( initialSelectedList ?? [] );

	const selectedSiteId = useSelector( getSelectedSiteId );

	const products: Product[] = useSelector( ( state ) =>
		getProductsForSiteId( state, selectedSiteId )
	);

	const onSelectProduct = ( event: ChangeEvent< HTMLInputElement > ) => {
		const productId =
			( event.target as HTMLInputElement ).value ??
			( event.target.parentElement as HTMLInputElement )?.value ??
			'';
		let newList = [];
		if ( allowMultiple ) {
			if ( COUPON_PRODUCTS_ANY === productId ) {
				setSelectedPlanIds( [] );
				return;
			}
			if ( selectedPlanIds.includes( parseInt( productId ) ) ) {
				setSelectedPlanIds(
					selectedPlanIds.filter(
						( selectedId: number ): boolean => selectedId !== parseInt( productId )
					)
				);
				return;
			}
			newList = [ ...selectedPlanIds, parseInt( productId ) ];
		} else {
			newList = [ parseInt( productId ) ];
		}
		setSelectedPlanIds( newList );
		onSelectedPlanIdsChange( newList );
	};

	/** Product functions */
	const getProductDescription = ( product: Product ): string => {
		const { title, currency, renewal_schedule, price } = product;
		const amount = formatCurrency( price ?? 0, currency ?? 'USD' );
		switch ( renewal_schedule ) {
			case '1 month':
				return sprintf(
					// translators: %1$s: product title, %2$s: amount
					__( '%1$s : %2$s / month', 'calypso' ),
					title,
					amount
				);
			case '1 year':
				return sprintf(
					// translators: %1$s: product title, %2$s: amount
					__( '%1$s : %2$s / year', 'calypso' ),
					title,
					amount
				);
			case 'one-time':
				return sprintf(
					// translators: %1$s: product title, %2$s: amount
					__( '%1$s : %2$s', 'calypso' ),
					title,
					amount
				);
			default:
				return sprintf(
					// translators: %1$s: product title, %2$s: amount, %3$s: plan interval
					__( '%1$s : %2$s / %3$s', 'calypso' ),
					title,
					amount,
					renewal_schedule
				);
		}
	};

	const selectedProductSummary = ( ( quantity: number ) => {
		if ( allowMultiple ) {
			if ( quantity > 1 ) {
				// translators: the %s is a number representing the number of products which are currently selected
				return sprintf( __( '%s products selected.' ), quantity );
			}
			if ( quantity === 1 ) {
				return __( '1 product selected' );
			}
			return translate( 'Any product' );
		}

		// ! allowMultiple
		if ( quantity === 1 ) {
			const productId = selectedPlanIds[ 0 ];
			const seletedProduct = products.filter(
				( product: Product ) => product.ID === productId
			)[ 0 ];

			if ( seletedProduct ) {
				return getProductDescription( seletedProduct );
			}
		}
		return translate( 'No product selected' );
	} )( selectedPlanIds.length );

	return (
		<FormFieldset className="memberships__dialog-sections-products">
			<QueryMemberships siteId={ selectedSiteId ?? 0 } />
			<FormLabel htmlFor="coupon_code">{ translate( 'Products' ) }</FormLabel>
			<ToolbarDropdownMenu
				icon={ chevronDown }
				label={ selectedProductSummary }
				text={ selectedProductSummary }
			>
				{ ( { onClose } ) => (
					<>
						{ allowMultiple && (
							<MenuGroup>
								<MenuItem
									value={ COUPON_PRODUCTS_ANY }
									onClick={ ( event: MouseEvent< HTMLButtonElement > ) =>
										onSelectProduct( event as unknown as ChangeEvent< HTMLInputElement > )
									}
									isSelected={ selectedPlanIds.length === 0 }
									icon={ selectedPlanIds.length === 0 ? check : null }
									key={ COUPON_PRODUCTS_ANY }
									role="menuitemcheckbox"
								>
									{ translate( 'Any product' ) }
								</MenuItem>
							</MenuGroup>
						) }
						<MenuGroup>
							{ products &&
								products.map( function ( currentProduct: Product ) {
									const isSelected =
										allowMultiple &&
										( selectedPlanIds.length === 0 ||
											( currentProduct.ID && selectedPlanIds.includes( currentProduct.ID ) ) );
									const itemIcon = isSelected ? check : null;
									return (
										<MenuItem
											value={ currentProduct.ID }
											onClick={ ( e ) => {
												( onSelectProduct as unknown as MouseEventHandler< HTMLButtonElement > )(
													e
												);
												if ( ! allowMultiple ) {
													onClose();
												}
											} }
											isSelected={ !! isSelected }
											icon={ itemIcon }
											key={ currentProduct.ID }
											role="menuitemcheckbox"
										>
											{ getProductDescription( currentProduct ) }
										</MenuItem>
									);
								} ) }
						</MenuGroup>
						<MenuGroup>
							<MenuItem
								value={ COUPON_PRODUCTS_ANY }
								onClick={ onClose }
								icon={ close }
								key={ COUPON_PRODUCTS_ANY }
								role="menuitemcheckbox"
							>
								{ translate( 'Close' ) }
							</MenuItem>
						</MenuGroup>
					</>
				) }
			</ToolbarDropdownMenu>
		</FormFieldset>
	);
};

export default ProductsSelector;
