import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { ADD_ON_50GB_STORAGE } from './constants';
import spaceUpgradeIcon from './icons/space-upgrade';
import type { AddOnMeta } from './types';

const STORAGE_ADD_ONS_MOCK: AddOnMeta[] = [
	{
		addOnSlug: ADD_ON_50GB_STORAGE,
		productSlug: PRODUCT_1GB_SPACE,
		featureSlugs: null,
		icon: spaceUpgradeIcon,
		quantity: 50,
		name: '50 GB Storage',
		displayCost: '50',
		prices: {
			monthlyPrice: 10,
			yearlyPrice: 120,
			formattedMonthlyPrice: 'USD10',
			formattedYearlyPrice: 'USD120',
			currencyCode: 'USD',
		},
		description: 'Make more space for high-quality photos, videos, and other media. ',
		featured: false,
		purchased: false,
		checkoutLink: 'checkout:storage-50gb',
	},
];

export { STORAGE_ADD_ONS_MOCK };
