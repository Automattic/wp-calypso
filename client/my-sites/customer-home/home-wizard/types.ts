export type GoalKey = 'write' | 'build' | 'sell' | 'newsletter' | 'promote' | 'portfolio';

export type FeatureKey =
	| 'forms'
	| 'newsletter'
	| 'store'
	| 'bookings'
	| 'gallery'
	| 'video'
	| 'memberships'
	| 'donations';

export type WizardAnswers = {
	goal: GoalKey | null;
	features: FeatureKey[];
};
