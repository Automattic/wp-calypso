import { formatNumber } from '@automattic/number-formatters';
import { _nx, _x, sprintf } from '@wordpress/i18n';
import getTitanReferralDetails from '../../lib/get-titan-referral-details';
import type { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	product: ReferralPurchase;
	productsData?: APIProductFamilyProduct[];
};

export default function ReferralTitanDetails( { product, productsData }: Props ) {
	const titan = getTitanReferralDetails( product, productsData );

	if ( ! titan ) {
		return null;
	}

	const planLabel = {
		standard: _x( 'Standard', 'Titan email plan' ),
		premium: _x( 'Premium', 'Titan email plan' ),
	};

	const pieces = [
		titan.plan && planLabel[ titan.plan ],
		titan.domain,
		titan.inboxes &&
			sprintf(
				/* translators: %s is the number of Titan inboxes */
				_nx( '%s inbox', '%s inboxes', titan.inboxes, 'Titan inbox count' ),
				formatNumber( titan.inboxes )
			),
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
