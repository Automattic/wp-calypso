import type { RetentionPeriod } from 'calypso/state/rewind/retention/types';

export interface RetentionRadioOptionType {
	label: string; // 7 days
	spaceNeededInBytes: number;
	upgradeRequired: boolean;
	isCurrentPlan: boolean;
	value: RetentionPeriod; // The number of days
	checked: boolean;
}
