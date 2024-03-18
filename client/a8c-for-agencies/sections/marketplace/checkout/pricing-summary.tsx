import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { getTotalInvoiceValue } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/pricing';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import ShoppingCartMenuItem from '../shopping-cart/shopping-cart-menu/item';
import { ShoppingCartItem } from '../types';

type Props = {
	items: ShoppingCartItem[];
	onRemoveItem: ( item: ShoppingCartItem ) => void;
};

export default function PricingSummary( { items, onRemoveItem }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const userProducts = useSelector( getProductsList );
	const { discountedCost, actualCost } = getTotalInvoiceValue( userProducts, items );

	const currency = items[ 0 ]?.currency ?? 'USD'; // FIXME: Fix if multiple currencies are supported

	const learnMoreLink = ''; //FIXME: Add link for A4A;

	const onClickLearnMore = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_learn_more_click' ) );
	}, [ dispatch ] );

	return (
		<div className="checkout__summary">
			<div className="checkout__summary-pricing">
				<span className="checkout__summary-pricing-discounted">
					{ formatCurrency( discountedCost, currency ) }
				</span>
				<span className="checkout__summary-pricing-original">
					{ formatCurrency( actualCost, currency ) }
				</span>
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
				<span>{ translate( 'Total:' ) }</span>
				<span>
					{ translate( '%(total)s/mo', {
						args: { total: formatCurrency( discountedCost, currency ) },
					} ) }
				</span>
			</div>

			<div className="checkout__summary-notice">
				{ translate(
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
				) }
			</div>
		</div>
	);
}
