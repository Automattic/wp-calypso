import { __ } from '@wordpress/i18n';

export const getWooPaymentsCardCopy = () => ( {
	title: __( 'Revenue share available' ),
	description: __(
		'Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients’ sites within Automattic for Agencies.'
	),
} );

export function getCartActionLabel( isReferralMode: boolean, inCart: boolean ): string {
	if ( isReferralMode ) {
		return inCart ? __( 'Added to referral' ) : __( 'Add to referral' );
	}
	return inCart ? __( 'Added to cart' ) : __( 'Add to cart' );
}
