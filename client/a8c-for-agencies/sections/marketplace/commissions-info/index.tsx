import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { getProductCommissionPercentage } from '../../referrals/lib/commissions';
import type { ShoppingCartItem } from '../types';

import './style.scss';

export default function CommissionsInfo( { items }: { items: ShoppingCartItem[] } ) {
	const translate = useTranslate();

	const totalCommissions = items.reduce( ( acc, item ) => {
		const product = item;
		const commissionPercentage = getProductCommissionPercentage( product );
		const totalCommissions = product?.amount ? Number( product.amount ) * commissionPercentage : 0;
		return acc + totalCommissions;
	}, 0 );

	return (
		<div className="commissions-info">
			<span>{ translate( 'Your estimated commision:' ) }</span>
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
