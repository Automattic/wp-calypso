export type GoalKey = 'write' | 'build' | 'sell' | 'newsletter' | 'educate' | 'portfolio';

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
	siteName: string;
	intent: string;
};
