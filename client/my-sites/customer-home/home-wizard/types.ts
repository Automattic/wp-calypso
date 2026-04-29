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
	// Kept for compatibility with the registry's filter shape; populated only
	// in the v1 (Goals + Features) variant. The AI prompt variant ignores
	// these fields.
	goal: GoalKey | null;
	features: FeatureKey[];
};

export type WizardVariant = 'textarea' | 'chips';
