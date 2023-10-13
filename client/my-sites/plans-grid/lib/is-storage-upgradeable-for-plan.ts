import type { StorageOption } from '@automattic/calypso-products';

export const isStorageUpgradeableForPlan = ( {
	// flowName,
	intervalType,
	// isInSignup,
	showUpgradeableStorage,
	storageOptions,
}: {
	flowName: string;
	intervalType: string;
	isInSignup: boolean;
	showUpgradeableStorage: boolean;
	storageOptions: StorageOption[];
} ) =>
	// Don't show for the enterprise plan which has no storage options
	storageOptions.length > 1 && intervalType === 'yearly' && showUpgradeableStorage;
// TODO: Revisit what conditions are necessary to continue hiding in stepper flows
// isInSignup &&
// flowName === 'onboarding';
