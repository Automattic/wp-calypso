import { __ } from '@wordpress/i18n';
import type { ReferHostingType } from './types';

/**
 * What differs between the two referral forms: copy, the Enterprise-only
 * opportunity fields and the Tracks events. The endpoint is picked by the
 * mutation the form uses.
 */
export function getReferralConfig( type: ReferHostingType ) {
	return {
		type,
		formTitle: {
			enterprise: __( 'Refer a client for WordPress VIP hosting' ),
			premium: __( 'Refer your client to a Premium plan' ),
		}[ type ],
		successTitle: {
			enterprise: __( 'Thank you for your WordPress VIP referral' ),
			premium: __( 'Thank you for your Premium plan referral' ),
		}[ type ],
		ctaText: {
			enterprise: __( 'Submit VIP referral' ),
			premium: __( 'Submit Premium plan referral' ),
		}[ type ],
		hasEnterpriseFields: type === 'enterprise',
		events: {
			formSubmit: {
				enterprise: 'calypso_a4a_marketplace_hosting_enterprise_refer_form_submit',
				premium: 'calypso_a4a_marketplace_hosting_premium_refer_form_submit',
			}[ type ],
			backToMarketplace: {
				enterprise: 'calypso_a4a_marketplace_hosting_enterprise_refer_form_back_to_marketplace',
				premium: 'calypso_a4a_marketplace_hosting_premium_refer_form_back_to_marketplace',
			}[ type ],
		},
	};
}

export type ReferralConfig = ReturnType< typeof getReferralConfig >;
