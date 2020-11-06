export enum ItemType {
	PRODUCT = 'product',
	BUNDLE = 'bundle',
	LEGACY_PLAN = 'legacy_plan',
}

export enum DailyRealtimeOption {
	DAILY = 'daily',
	REALTIME = 'realtime',
}

// Same values as TERM_MONTHLY and TERM_ANNUALLY in calypso/lib/plans/constants
export enum BillingTerm {
	MONTHLY = 'TERM_MONTHLY',
	ANNUAL = 'TERM_ANNUALLY',
}
