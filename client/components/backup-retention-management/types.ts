import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';

export interface RetentionRadioOptionType {
	spaceNeededInBytes: number;
	upgradeRequired: boolean;
	isCurrentPlan: boolean;
	value: RetentionPeriod; // The number of days
	checked: boolean;
}

export interface RetentionOptionInput {
	id: RetentionPeriod;
	spaceNeededInBytes: number;
	upgradeRequired: boolean;
}
