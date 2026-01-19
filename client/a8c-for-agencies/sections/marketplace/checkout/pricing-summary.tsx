import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import CommissionsInfo from '../commissions-info';
import { useTotalInvoiceValue, useTermPricingText } from '../hooks/use-marketplace';
import ShoppingCartMenuItem from '../shopping-cart/shopping-cart-menu/item';
import type { ShoppingCartItem, TermPricingType } from '../types';

type Props = {
	items: ShoppingCartItem[];
	isAutomatedReferrals?: boolean;
	onRemoveItem?: ( item: ShoppingCartItem ) => void;
	isClient?: boolean;
	termPricing?: TermPricingType;
};

export default function PricingSummary( {
	items,
	onRemoveItem,
	isAutomatedReferrals,
	isClient,
	termPricing,
}: Props ) {
	const translate = useTranslate();

	const userProducts = useSelector( getProductsList );

	const { getTotalInvoiceValue } = useTotalInvoiceValue(
		termPricing,
		items[ 0 ]?.currency ?? 'USD'
	);

	const {
		actualCost,
		discountedCost,
		totalActualCostFormatted,
		totalDiscountedCostFormatted,
		totalActualCostFormattedText,
		totalDiscountedCostFormattedText,
	} = getTotalInvoiceValue( userProducts, items );

	const termPricingText = useTermPricingText( termPricing, false );

	// Show actual cost if the agency is referring a client
	const totalCost = isAutomatedReferrals ? actualCost : discountedCost;
	const totalCostFormatted = isAutomatedReferrals
		? totalActualCostFormatted
		: totalDiscountedCostFormatted;
	const totalCostFormattedText = isAutomatedReferrals
		? totalActualCostFormattedText
		: totalDiscountedCostFormattedText;

	// Agency checkout is when the user is not purchasing automated referrals and not a client
	const isAgencyCheckout = ! isAutomatedReferrals && ! isClient;

	const showOriginalPrice = isAgencyCheckout && totalCost !== actualCost;

	return (
		<div className="checkout__summary">
			<div className="checkout__summary-pricing">
				<span className="checkout__summary-pricing-discounted">{ totalCostFormatted }</span>
				{
					// Show the discounted price only if it is agency checkout
					showOriginalPrice && (
						<span className="checkout__summary-pricing-original">{ totalActualCostFormatted }</span>
					)
				}
				<div className="checkout__summary-pricing-interval">{ termPricingText }</div>
			</div>
			<ul className="checkout__summary-items">
				{ items.map( ( item ) => (
					<ShoppingCartMenuItem
						key={ `shopping-cart-item-${ item.product_id }-${ item.quantity }` }
						item={ item }
						onRemoveItem={ onRemoveItem }
						termPricing={ termPricing }
					/>
				) ) }
			</ul>
			<hr />
			<div className="checkout__summary-total">
				<span>
					{ isAutomatedReferrals
						? translate( 'Total your client will pay:' )
						: translate( 'Total:' ) }
				</span>
				<span>{ totalCostFormattedText }</span>
			</div>
			{ isAutomatedReferrals && <CommissionsInfo items={ items } termPricing={ termPricing } /> }
		</div>
	);
}
