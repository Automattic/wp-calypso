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
	description: {
		enterprise: translate(
			"Your client referral to Enterprise VIP Hosting is appreciated. We'll take it from here and ensure you're updated on our progress."
		),
		premium: translate(
			"Your client referral to a Premium plan is appreciated. We'll take it from here and ensure you're updated on our progress."
		),
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
		rfp: {
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
