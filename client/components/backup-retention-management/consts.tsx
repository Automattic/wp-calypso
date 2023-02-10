import type { TranslateResult } from 'i18n-calypso';

export const RetentionOptions = {
	RETENTION_DAYS_7: 7,
	RETENTION_DAYS_30: 30,
	RETENTION_DAYS_120: 120,
	RETENTION_DAYS_365: 365,
} as const;

export interface RetentionRadioOptionType {
	label: string; // 7 days
	spaceNeeded: TranslateResult | string; // 700MB
	upgradeRequired: boolean;
	isCurrentPlan: boolean;
	value: number; // 7
	checked: boolean;
}
