import { useTranslate } from 'i18n-calypso';
import WooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woopayments.svg';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

type CustomProductCard = {
	className: string;
	image: string;
	title: string;
	description: string;
};

export default function useCustomProductCard(
	currentProduct: APIProductFamilyProduct | null
): CustomProductCard | null {
	const translate = useTranslate();

	if ( currentProduct?.slug === 'woocommerce-woopayments' ) {
		return {
			className: 'is-woopayments',
			image: WooPaymentsLogo,
			title: translate( 'Revenue share available' ),
			description: translate(
				"Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients' sites within Automattic for Agencies."
			),
		};
	}

	return null;
}
