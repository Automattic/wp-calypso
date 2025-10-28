import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';

const TARGET_INFLUENCED_REVENUE = {
	'emerging-partner': 0,
	'agency-partner': 1000,
	'pro-agency-partner': 5000,
	'premier-partner': 250000,
};

export const ALL_TIERS = [
	{
		level: 0,
		id: 'emerging-partner',
		name: __( 'Account activated' ),
		description: 'Joining the program',
		heading: __( 'Essential benefits' ),
		subheading: __( 'Tools, earning opportunities, support & training and more' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'emerging-partner' ],
	},
	{
		level: 1,
		id: 'agency-partner',
		name: __( 'Agency Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'agency-partner' ], 'USD' )
		),
		heading: __( '2 additional benefits unlocked' ),
		subheading: __( 'Directory visibility, early access' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'agency-partner' ],
	},
	{
		level: 2,
		id: 'pro-agency-partner',
		name: __( 'Pro Agency Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ], 'USD' )
		),
		heading: __( '3 additional benefits unlocked' ),
		subheading: __( 'Co-marketing, qualified leads, partner manager & more' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ],
	},
	{
		level: 3,
		id: 'premier-partner',
		name: __( 'Premier Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'premier-partner' ], 'USD' )
		),
		heading: __( '3 premium benefits' ),
		subheading: __( 'Annual credits, Parse.ly trial, marketing funds' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'premier-partner' ],
	},
];
