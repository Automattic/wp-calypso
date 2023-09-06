import type { StorageOption } from '@automattic/calypso-products';

export const isStorageUpgradeableForPlan = (
	storageOptions: StorageOption[],
	intervalType: string | undefined,
	showUpgradeableStorage: boolean | undefined,
	isInSignup: boolean | undefined,
	flowName: string | null | undefined
) =>
	storageOptions.length > 1 &&
	intervalType === 'yearly' &&
	showUpgradeableStorage &&
	isInSignup &&
	flowName === 'onboarding';
