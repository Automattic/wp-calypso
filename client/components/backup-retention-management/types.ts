import type { TranslateResult } from 'i18n-calypso';

export interface RetentionRadioOptionType {
	label: string; // 7 days
	spaceNeeded: TranslateResult | string; // 700MB
	upgradeRequired: boolean;
	isCurrentPlan: boolean;
	value: number; // 7
	checked: boolean;
}
