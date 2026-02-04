import { isEnabled } from '@automattic/calypso-config';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { getProductCommissionPercentage } from '../../referrals/lib/commissions';
import type { ShoppingCartItem, TermPricingType } from '../types';

import './style.scss';

export default function CommissionsInfo( {
	items,
	termPricing,
}: {
	items: ShoppingCartItem[];
	termPricing?: TermPricingType;
} ) {
	const translate = useTranslate();

	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	const totalCommissions = items.reduce( ( acc, item ) => {
		const product = item;
		const commissionPercentage = getProductCommissionPercentage(
			product.slug,
			product.family_slug
		);
		const termPrice =
			termPricing === 'yearly'
				? product.yearly_introductory_price ?? product.yearly_price ?? 0
				: product.monthly_introductory_price ?? product.monthly_price ?? 0;
		const productAmount = product?.amount ? Number( product.amount.replace( /,/g, '' ) ) : 0;
		const productPrice = isTermPricingEnabled ? termPrice : productAmount;
		const totalCommissions = productPrice * commissionPercentage || 0;
		return acc + totalCommissions;
	}, 0 );

	// If the total commissions are 0, don't show the commissions info
	if ( totalCommissions === 0 ) {
		return null;
	}

	const currency = items[ 0 ]?.currency ?? 'USD';

	const totalPricePerTerm =
		isTermPricingEnabled && termPricing === 'yearly'
			? translate( '%(total)s/yr', {
					args: {
						total: formatCurrency( totalCommissions, currency ),
					},
			  } )
			: translate( '%(total)s/mo', {
					args: {
						total: formatCurrency( totalCommissions, currency ),
					},
			  } );

	return (
		<div className="commissions-info">
			<span>{ translate( 'Your estimated commission:' ) }</span>
			<span>{ totalPricePerTerm }</span>
		</div>
	);
}
