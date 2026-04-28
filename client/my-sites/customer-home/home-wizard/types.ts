export type GoalKey = 'write' | 'build' | 'sell' | 'newsletter' | 'promote' | 'portfolio';

export type FeatureKey =
	| 'forms'
	| 'newsletter'
	| 'store'
	| 'comments'
	| 'analytics'
	| 'ai-assistant'
	| 'memberships'
	| 'donations';

export type WizardAnswers = {
	goal: GoalKey | null;
	features: FeatureKey[];
};
