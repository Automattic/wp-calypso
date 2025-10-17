import type { ReferHostingType } from '../types';

export const getReferralConfig = (
	translate: ( key: string, options?: unknown ) => string,
	type: ReferHostingType
) => ( {
	pageTitle: {
		enterprise: translate( 'Refer Enterprise Hosting' ),
		premium: translate( 'Refer Premium Plan' ),
	}[ type ],
	formTitle: {
		enterprise: translate( 'Submit WordPress VIP referral' ),
		premium: translate( 'Refer your client to a Premium plan' ),
	}[ type ],
	successTitle: {
		enterprise: translate( 'Thank you for your WordPress VIP referral' ),
		premium: translate( 'Thank you for your Premium plan referral' ),
	}[ type ],
	ctaText: {
		enterprise: translate( 'Submit VIP referral' ),
		premium: translate( 'Submit Premium plan referral' ),
	}[ type ],
	companyTitle: {
		enterprise: translate( 'End user company information' ),
		premium: translate( "Your client's company information" ),
	}[ type ],
	contactTitle: {
		enterprise: translate( 'End user contact information' ),
		premium: translate( "Your client's contact information" ),
	}[ type ],
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
	fields: {
		leadType: {
			enabled: type === 'enterprise',
		},
		isRfp: {
			enabled: type === 'enterprise',
		},
	},
	api: {
		endpoint: {
			enterprise: '/agency/vip/partner-opportunity',
			premium: '/agency/pressable/premium-plan-referral',
		}[ type ],
	},
} );
