import { isEnabled } from '@automattic/calypso-config';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import A4ANumberInputV2 from 'calypso/a8c-for-agencies/components/a4a-number-input-v2';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	checkProductTermAvailability,
	useGetProductPricingInfo,
	useTermPricingText,
} from '../../hooks/use-marketplace';
import { getMaxLicenses } from '../../lib/cart-licenses';
import { isWPCOMHostingProduct } from '../../lib/hosting';
import type { ShoppingCartItem, TermPricingType } from '../../types';

import './style.scss';

type ItemProps = {
	item: ShoppingCartItem;
	onRemoveItem?: ( item: ShoppingCartItem ) => void;
	termPricing?: TermPricingType;
	/** Set when the line's count can change, from its counter. */
	onSetQuantity?: ( item: ShoppingCartItem, quantity: number ) => void;
};

export default function ShoppingCartMenuItem( {
	item,
	onRemoveItem,
	termPricing,
	onSetQuantity,
}: ItemProps ) {
	const translate = useTranslate();
	const userProducts = useSelector( getProductsList );

	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	const { getProductPricingInfo } = useGetProductPricingInfo( termPricing, item.currency );
	const { showActualCost, discountedCost, discountedCostFormatted, actualCostFormatted, isFree } =
		getProductPricingInfo( userProducts, item, item.quantity );
	const termPricingText = useTermPricingText( termPricing );
	// TODO: We are removing Creator's product name in the frontend because we want to leave it in the backend for the time being,
	//       We have to refactor this once we have updates. Context: p1714663834375719-slack-C06JY8QL0TU
	const productDisplayName =
		item.slug === 'wpcom-hosting-business' ? translate( 'WordPress.com Site' ) : item.name;
	// Billing Dragon lines show their count with the price of one; a count on the
	// previous billing system is a bundle size, so it stays in the name.
	const showsUnitPrice = isEnabled( 'a4a-bd-checkout' ) && item.quantity > 1 && ! isFree;
	const itemDisplayName =
		item.quantity > 1 && ! onSetQuantity && ! showsUnitPrice
			? translate( '%(productName)s x %(quantity)s', {
					args: { productName: productDisplayName, quantity: item.quantity },
				} )
			: productDisplayName;

	// The price of one comes from the line's total, as WordPress.com's falls with the volume tier.
	const unitPrice =
		formatCurrency( discountedCost / item.quantity, item.currency ?? 'USD' ) + termPricingText;
	const unitPriceText = isWPCOMHostingProduct( item.family_slug )
		? translate( '%(quantity)s site at %(price)s each', '%(quantity)s sites at %(price)s each', {
				count: item.quantity,
				args: { quantity: formatNumber( item.quantity ), price: unitPrice },
				comment: '%(price)s is the price of one site, such as "$25.00/mo".',
			} )
		: translate(
				'%(quantity)s license at %(price)s each',
				'%(quantity)s licenses at %(price)s each',
				{
					count: item.quantity,
					args: { quantity: formatNumber( item.quantity ), price: unitPrice },
					comment: '%(price)s is the price of one license, such as "$149.00/yr".',
				}
			);

	const { isMissingMonthlyId, isMissingYearlyId } = checkProductTermAvailability(
		item,
		termPricing
	);

	return (
		<li className="shopping-cart__menu-list-item">
			<Icon className="shopping-cart__menu-list-item-icon" icon={ check } />
			<div className="shopping-cart__menu-list-item-details">
				<div className="shopping-cart__menu-list-item-title">{ itemDisplayName }</div>
				<div className="shopping-cart__menu-list-item-price">
					{ isFree ? (
						translate( 'Free' )
					) : (
						<>
							<span className="shopping-cart__menu-list-item-price-discounted">
								{ discountedCostFormatted }
							</span>
							{ showActualCost && (
								<span className="shopping-cart__menu-list-item-price-actual">
									{ actualCostFormatted }
								</span>
							) }
							<span>{ termPricingText }</span>
							&nbsp;
							{ isTermPricingEnabled && isMissingMonthlyId && (
								<span>({ translate( 'billed yearly' ) })</span>
							) }
							{ isTermPricingEnabled && isMissingYearlyId && (
								<span>({ translate( 'billed monthly' ) })</span>
							) }
						</>
					) }
				</div>
				{ showsUnitPrice && (
					<div className="shopping-cart__menu-list-item-unit-price">{ unitPriceText }</div>
				) }
			</div>
			<VStack
				className={ clsx( 'shopping-cart__menu-list-item-actions', {
					'is-centered': ! onSetQuantity,
				} ) }
				spacing={ 2 }
				alignment="flex-end"
				expanded={ false }
			>
				{ onSetQuantity && (
					<div className="shopping-cart__menu-list-item-count">
						<A4ANumberInputV2
							label={ translate( 'Number of %(productName)s', {
								args: { productName: productDisplayName },
							} ) }
							value={ item.quantity }
							maximum={ getMaxLicenses( item ) }
							onChange={ ( quantity ) =>
								onSetQuantity( item, Math.min( getMaxLicenses( item ), quantity ) )
							}
						/>
					</div>
				) }
				{ onRemoveItem && (
					<Button
						className="shopping-cart__menu-item-remove-button"
						variant="link"
						onClick={ () => onRemoveItem( item ) }
					>
						{ translate( 'Remove' ) }
					</Button>
				) }
			</VStack>
		</li>
	);
}
