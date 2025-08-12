// @ts-nocheck - TODO: Fix TypeScript issues
import { DOMAIN_PRIMARY } from 'calypso/state/sites/domains/test/fixture';
import type { ResponseDomain, EmailCost } from 'calypso/lib/domains/types';

export const exampleTrialEmailCost: EmailCost = {
	amount: 0,
	currency: 'EUR',
	text: '€0.00',
};

export const examplePaidEmailCost: EmailCost = {
	amount: 28.42,
	currency: 'EUR',
	text: '€28.42',
};

export const exampleTrialResponseDomain: ResponseDomain = {
	...DOMAIN_PRIMARY,
	titanMailSubscription: {
		purchaseCostPerMailbox: {
			...exampleTrialEmailCost,
		},
	},
};

export const examplePaidResponseDomain: ResponseDomain = {
	...DOMAIN_PRIMARY,
	titanMailSubscription: {
		purchaseCostPerMailbox: {
			...examplePaidEmailCost,
		},
	},
};
