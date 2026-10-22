import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import getTitanReferralDetails from '../../lib/get-titan-referral-details';
import type { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	product: ReferralPurchase;
	productsData?: APIProductFamilyProduct[];
};

export default function ReferralTitanDetails( { product, productsData }: Props ) {
	const translate = useTranslate();

	const titan = getTitanReferralDetails( product, productsData );

	if ( ! titan ) {
		return null;
	}

	const planLabel = {
		standard: translate( 'Standard', { context: 'Titan email plan' } ),
		premium: translate( 'Premium', { context: 'Titan email plan' } ),
	};

	const pieces = [
		titan.plan && planLabel[ titan.plan ],
		titan.domain,
		titan.inboxes &&
			translate( '%(count)s inbox', '%(count)s inboxes', {
				count: titan.inboxes,
				args: { count: formatNumber( titan.inboxes ) },
				context: 'Titan inbox count',
			} ),
	].filter( Boolean );

	if ( pieces.length === 0 ) {
		return null;
	}

	return (
		<div className="referral-titan-details">
			{ pieces.map( ( piece, index ) => (
				<span key={ index } className="referral-titan-details__item">
					{ piece }
				</span>
			) ) }
		</div>
	);
}
