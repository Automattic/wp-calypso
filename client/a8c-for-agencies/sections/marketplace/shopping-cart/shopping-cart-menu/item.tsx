import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { Icon, check, plus, lineSolid } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	checkProductTermAvailability,
	useGetProductPricingInfo,
	useTermPricingText,
} from '../../hooks/use-marketplace';
import type { ShoppingCartItem, TermPricingType } from '../../types';

import './style.scss';

type ItemProps = {
	item: ShoppingCartItem;
	count?: number;
	onRemoveItem?: ( item: ShoppingCartItem ) => void;
	onIncrementItem?: ( item: ShoppingCartItem ) => void;
	onDecrementItem?: ( item: ShoppingCartItem ) => void;
	termPricing?: TermPricingType;
};

export default function ShoppingCartMenuItem( {
	item,
	count = 1,
	onRemoveItem,
	onIncrementItem,
	onDecrementItem,
	termPricing,
}: ItemProps ) {
	const translate = useTranslate();
	const userProducts = useSelector( getProductsList );

	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	const { getProductPricingInfo } = useGetProductPricingInfo( termPricing, item.currency );
	const { showActualCost, discountedCostFormatted, actualCostFormatted, isFree } =
		getProductPricingInfo( userProducts, item, item.quantity );
	const termPricingText = useTermPricingText( termPricing );
	// TODO: We are removing Creator's product name in the frontend because we want to leave it in the backend for the time being,
	//       We have to refactor this once we have updates. Context: p1714663834375719-slack-C06JY8QL0TU
	const productDisplayName =
		item.slug === 'wpcom-hosting-business' ? translate( 'WordPress.com Site' ) : item.name;
	const itemDisplayName =
		item.quantity > 1
			? translate( '%(productName)s x %(quantity)s', {
					args: { productName: productDisplayName, quantity: item.quantity },
			  } )
			: productDisplayName;

	const { isMissingMonthlyId, isMissingYearlyId } = checkProductTermAvailability(
		item,
		termPricing
	);

	const showQuantityStepper = !! ( onIncrementItem && onDecrementItem );

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
			</div>
			<div className="shopping-cart__menu-list-item-actions">
				{ showQuantityStepper && (
					<div className="shopping-cart__menu-item-quantity">
						<Button
							className="shopping-cart__menu-item-quantity-button"
							icon={ lineSolid }
							label={ translate( 'Remove one' ) }
							onClick={ () => onDecrementItem?.( item ) }
							size="small"
						/>
						<span className="shopping-cart__menu-item-quantity-count">{ count }</span>
						<Button
							className="shopping-cart__menu-item-quantity-button"
							icon={ plus }
							label={ translate( 'Add one' ) }
							onClick={ () => onIncrementItem?.( item ) }
							size="small"
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
			</div>
		</li>
	);
}
