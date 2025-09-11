import { MembershipSubscription } from './types';

export function normalizeMonetizeSubscription(
	rawMonetizeSubscription: MembershipSubscription
): MembershipSubscription {
	return {
		...rawMonetizeSubscription,
	};
}
