import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import ShoppingCartMenuItem from '../shopping-cart/shopping-cart-menu/item';
import { useTotalInvoiceValue } from '../wpcom-overview/hooks/use-total-invoice-value';
import type { ShoppingCartItem } from '../types';

type Props = {
	items: ShoppingCartItem[];
	isAutomatedReferrals?: boolean;
	onRemoveItem?: ( item: ShoppingCartItem ) => void;
};

export default function PricingSummary( { items, onRemoveItem, isAutomatedReferrals }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const userProducts = useSelector( getProductsList );

	const { getTotalInvoiceValue } = useTotalInvoiceValue();

	const { discountedCost, actualCost } = getTotalInvoiceValue( userProducts, items );

	// FIXME: we should update the magic numbers here with values when backend part is finished.
	const commissionAmount = Math.floor( discountedCost * 0.5 );

	const currency = items[ 0 ]?.currency ?? 'USD'; // FIXME: Fix if multiple currencies are supported

	const learnMoreLink = ''; //FIXME: Add link for A4A;

	const onClickLearnMore = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_learn_more_click' ) );
	}, [ dispatch ] );

	const showLearnMoreLink = false; // FIXME: Remove this once the correct link is added

	const totalCost = isAutomatedReferrals ? actualCost : discountedCost;

	return (
		<div className="checkout__summary">
			<div className="checkout__summary-pricing">
				<span className="checkout__summary-pricing-discounted">
					{ formatCurrency( totalCost, currency ) }
				</span>
				{ ! isAutomatedReferrals && (
					<span className="checkout__summary-pricing-original">
						{ formatCurrency( actualCost, currency ) }
					</span>
				) }
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

			{ isAutomatedReferrals && (
				<div className="shopping-cart__menu-commission">
					<span>{ translate( 'Your estimated commision:' ) }</span>
					<span>
						{ translate( '%(total)s/mo', {
							args: {
								total: formatCurrency( commissionAmount, items[ 0 ]?.currency ?? 'USD' ),
							},
						} ) }
					</span>
				</div>
			) }

			{ ! isAutomatedReferrals && (
				<div className="checkout__summary-notice">
					{ showLearnMoreLink
						? translate(
								'You will be billed at the end of every month. Your first month may be less than the above amount. {{a}}Learn more{{/a}}',
								{
									components: {
										a: (
											<a
												href={ learnMoreLink }
												target="_blank"
												rel="noopener noreferrer"
												onClick={ onClickLearnMore }
											/>
										),
									},
								}
						  )
						: translate(
								'You will be billed at the end of every month. Your first month may be less than the above amount.'
						  ) }
				</div>
			) }
		</div>
	);
}
