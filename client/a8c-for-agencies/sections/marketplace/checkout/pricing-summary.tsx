import formatCurrency from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import ShoppingCartMenuItem from '../shopping-cart/shopping-cart-menu/item';
import { useTotalInvoiceValue } from '../wpcom-overview/hooks/use-total-invoice-value';
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

	return (
		<div className="checkout__summary">
			<div className="checkout__summary-pricing">
				<span className="checkout__summary-pricing-discounted">
					{ formatCurrency( totalCost, currency ) }
				</span>
				{
					// Show the discounted price only if it is agency checkout
					isAgencyCheckout && (
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

			{
				// Show the notice only if it is agency checkout
				isAgencyCheckout && (
					<div className="checkout__summary-notice">
						<h3>{ translate( 'When you purchase:' ) }</h3>
						<p>
							{ translate(
								'You agree to our {{a}}Terms of Service{{/a}}, and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time.',
								{
									components: {
										a: (
											<a
												href={ localizeUrl( 'https://wordpress.com/tos/' ) }
												target="_blank"
												rel="noreferrer"
											/>
										),
									},
								}
							) }
						</p>
						<p>
							{ translate(
								'You understand {{a}}how your subscription works{{/a}} and {{a}}how to cancel{{/a}}.',
								{
									components: {
										a: (
											<a
												href={ localizeUrl(
													'https://agencieshelp.automattic.com/knowledge-base/billing-and-payments/'
												) }
												target="_blank"
												rel="noreferrer"
											/>
										),
									},
								}
							) }
						</p>
						<p>
							{ translate(
								'You will be billed on the first of every month. Your first bill will include a prorated amount for the current month, depending on which day you purchased these products.'
							) }
						</p>
					</div>
				)
			}
		</div>
	);
}
