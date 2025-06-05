import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { getProductCommissionPercentage } from '../../referrals/lib/commissions';
import type { ShoppingCartItem } from '../types';

import './style.scss';

export default function CommissionsInfo( { items }: { items: ShoppingCartItem[] } ) {
	const translate = useTranslate();

	const totalCommissions = items.reduce( ( acc, item ) => {
		const product = item;
		const commissionPercentage = getProductCommissionPercentage( product.family_slug );
		const totalCommissions = product?.amount
			? Number( product.amount.replace( /,/g, '' ) ) * commissionPercentage
			: 0;
		return acc + totalCommissions;
	}, 0 );

	// If the total commissions are 0, don't show the commissions info
	if ( totalCommissions === 0 ) {
		return null;
	}

	return (
		<div className="commissions-info">
			<span>{ translate( 'Your estimated commission:' ) }</span>
			<span>
				{ translate( '%(total)s/mo', {
					args: {
						total: formatCurrency( totalCommissions, 'USD' ),
					},
				} ) }
			</span>
		</div>
	);
}
