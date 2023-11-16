import { translate } from 'i18n-calypso';
import { TierOption } from 'calypso/my-sites/themes/v2/types';

const TIERS: Array< TierOption > = [
	{
		value: 'all',
		label: translate( 'All' ),
	},
	{ value: 'free', label: translate( 'Free' ) },
	{ value: 'premium', label: translate( 'Premium' ) },
	{
		value: 'marketplace',
		label: translate( 'Partner', {
			context: 'This theme is developed and supported by a theme partner',
		} ),
	},
];

export { TIERS };
