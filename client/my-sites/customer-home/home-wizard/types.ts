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
	prompt: string;
	// Kept for compatibility with the registry's filter shape; the AI prompt
	// variant leaves these empty and the inferred goal/features are derived
	// from the prompt itself.
	goal: GoalKey | null;
	features: FeatureKey[];
};
