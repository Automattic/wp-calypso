/**
 * Solution card config for the cancellation solutions-cards upsell step.
 * Labels are intended to be passed to translate() in the UI for i18n.
 */
export type SolutionCardConfig = {
	id: string;
	label: string;
};

const SOLUTION_IDS = {
	CHANGE_PLAN: 'change-plan',
	RENEW_NOW_PAY_LESS: 'renew-now-pay-less',
	SWITCH_TO_MONTHLY: 'switch-to-monthly',
	SPEAK_WITH_SUPPORT: 'speak-with-support',
	BUILT_BY: 'built-by',
	ASK_AI_ASSISTANT: 'ask-ai-assistant',
} as const;

/** Too expensive: Expensive for the features offered */
const SOLUTIONS_TOO_EXPENSIVE: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN, label: 'Change plan' },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS, label: 'Renew now and pay less' },
	{ id: SOLUTION_IDS.SWITCH_TO_MONTHLY, label: 'Switch to monthly payments' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Too expensive: Lack of flexibility for the price (lackOfCustomization under price/budget) */
const SOLUTIONS_LACK_OF_FLEXIBILITY: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN, label: 'Change plan' },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS, label: 'Renew now and pay less' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Too expensive: Found competitor / Free plan is enough */
const SOLUTIONS_FOUND_BETTER_OR_FREE: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS, label: 'Renew now and pay less' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Too expensive: Budget changed */
const SOLUTIONS_BUDGET_CONSTRAINTS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN, label: 'Change plan' },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS, label: 'Renew now and pay less' },
	{ id: SOLUTION_IDS.SWITCH_TO_MONTHLY, label: 'Switch to monthly payments' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Too hard to use: Dashboard / Editor (with AI option) */
const SOLUTIONS_HARD_TO_USE_WITH_AI: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.BUILT_BY, label: 'Let us build for you' },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT, label: 'Ask our AI assistant' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Too hard to use: Takes too much time / Tutorials not helpful (no AI option) */
const SOLUTIONS_HARD_TO_USE_SUPPORT_ONLY: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.BUILT_BY, label: 'Let us build for you' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/**
 * Returns the ordered list of solution cards for the given cancellation sub-reason,
 * or null when this reason has no solutions step.
 */
export function getSolutionsForReason( reason: string ): SolutionCardConfig[] | null {
	switch ( reason ) {
		// Too expensive
		case 'tooExpensive':
			return [ ...SOLUTIONS_TOO_EXPENSIVE ];
		case 'lackOfCustomization':
			return [ ...SOLUTIONS_LACK_OF_FLEXIBILITY ];
		case 'foundBetterValue':
		case 'freeIsGoodEnough':
			return [ ...SOLUTIONS_FOUND_BETTER_OR_FREE ];
		case 'budgetConstraints':
			return [ ...SOLUTIONS_BUDGET_CONSTRAINTS ];
		case 'otherPriceValue':
			return null;

		// Too hard to use
		case 'complicatedDashboard':
		case 'difficultEditor':
			return [ ...SOLUTIONS_HARD_TO_USE_WITH_AI ];
		case 'tooMuchTimeToLearn':
		case 'inadequateOnboarding':
			return [ ...SOLUTIONS_HARD_TO_USE_SUPPORT_ONLY ];
		case 'otherTooHardToUse':
			return null;

		default:
			return null;
	}
}
