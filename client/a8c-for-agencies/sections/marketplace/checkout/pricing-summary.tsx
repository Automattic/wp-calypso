import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import CommissionsInfo from '../commissions-info';
import { useTotalInvoiceValue } from '../hooks/use-total-invoice-value';
import ShoppingCartMenuItem from '../shopping-cart/shopping-cart-menu/item';
import type { ShoppingCartItem } from '../types';

type Props = {
	items: ShoppingCartItem[];
	isAutomatedReferrals?: boolean;
	onRemoveItem?: ( item: ShoppingCartItem ) => void;
	isClient?: boolean;
};

export default function PricingSummary( {
	items,
	onRemoveItem,
	isAutomatedReferrals,
	isClient,
}: Props ) {
	const translate = useTranslate();

	const userProducts = useSelector( getProductsList );

	const { getTotalInvoiceValue } = useTotalInvoiceValue();

	const { discountedCost, actualCost } = getTotalInvoiceValue( userProducts, items );

	const currency = items[ 0 ]?.currency ?? 'USD'; // FIXME: Fix if multiple currencies are supported

	// Show actual cost if the agency is referring a client
	const totalCost = isAutomatedReferrals ? actualCost : discountedCost;

	// Agency checkout is when the user is not purchasing automated referrals and not a client
	const isAgencyCheckout = ! isAutomatedReferrals && ! isClient;

	const showOriginalPrice = isAgencyCheckout && totalCost !== actualCost;

	return (
		<div className="checkout__summary">
			<div className="checkout__summary-pricing">
				<span className="checkout__summary-pricing-discounted">
					{ formatCurrency( totalCost, currency ) }
				</span>
				{
					// Show the discounted price only if it is agency checkout
					showOriginalPrice && (
						<span className="checkout__summary-pricing-original">
							{ formatCurrency( actualCost, currency ) }
						</span>
					)
				}
				<div className="checkout__summary-pricing-interval">{ translate( '/month' ) }</div>
			</div>
			<ul className="checkout__summary-items">
				{ items.map( ( item ) => (
					<ShoppingCartMenuItem
						key={ `shopping-cart-item-${ item.product_id }-${ item.quantity }` }
						item={ item }
						onRemoveItem={ onRemoveItem }
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
				<span>
					{ translate( '%(total)s/mo', {
						args: { total: formatCurrency( totalCost, currency ) },
					} ) }
				</span>
			</div>
			{ isAutomatedReferrals && <CommissionsInfo items={ items } /> }
		</div>
	);
}
