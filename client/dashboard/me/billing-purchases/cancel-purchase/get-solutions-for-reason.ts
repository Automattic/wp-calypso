/**
 * Solution card config for the cancellation solutions-cards upsell step.
 */
export type SolutionCardConfig = {
	id: string;
};

/**
 * Cancellation reasons where price is the driver. When the user is already on
 * a Personal plan, we suppress the "change-plan" card for these because there
 * is no cheaper paid plan to recommend.
 */
export const PRICE_MOTIVATED_REASONS: ReadonlySet< string > = new Set( [
	'tooExpensive',
	'lackOfCustomization',
	'foundBetterValue',
	'freeIsGoodEnough',
	'budgetConstraints',
] );

const SOLUTION_IDS = {
	CHANGE_PLAN: 'change-plan',
	RENEW_NOW_PAY_LESS: 'renew-now-pay-less',
	SWITCH_TO_MONTHLY: 'switch-to-monthly',
	SPEAK_WITH_SUPPORT: 'speak-with-support',
	BUILT_BY: 'built-by',
	ASK_AI_ASSISTANT: 'ask-ai-assistant',
	UPGRADE_FULL_ACCESS: 'upgrade-for-full-access',
	GET_THEME_ADDON: 'get-theme-addon',
	FIND_GUIDES: 'find-guides',
	MAKE_SITE_FASTER: 'make-site-faster',
	USE_MIGRATION_TOOLS: 'use-migration-tools',
	USE_DOMAIN_GUIDE: 'use-domain-guide',
	EXPLORE_DOMAIN_OPTIONS: 'explore-domain-options',
} as const;

/** Too expensive: Expensive for the features offered */
const SOLUTIONS_TOO_EXPENSIVE: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.SWITCH_TO_MONTHLY },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Too expensive: Lack of flexibility for the price (lackOfCustomization under price/budget) */
const SOLUTIONS_LACK_OF_FLEXIBILITY: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Too expensive: Found competitor / Free plan is enough */
const SOLUTIONS_FOUND_BETTER_OR_FREE: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.SWITCH_TO_MONTHLY },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Too expensive: Budget changed */
const SOLUTIONS_BUDGET_CONSTRAINTS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.SWITCH_TO_MONTHLY },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Too hard to use: Dashboard / Editor (with AI option) */
const SOLUTIONS_HARD_TO_USE_WITH_AI: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.BUILT_BY },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Too hard to use: Takes too much time / Tutorials not helpful (no AI option) */
const SOLUTIONS_HARD_TO_USE_SUPPORT_ONLY: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.BUILT_BY },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Cannot install plugins */
const SOLUTIONS_CANNOT_INSTALL_PLUGINS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Cannot upload themes */
const SOLUTIONS_CANNOT_UPLOAD_THEMES: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Limited customization */
const SOLUTIONS_LIMITED_CUSTOMIZATION: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Missing functionality */
const SOLUTIONS_MISSING_FUNCTIONALITY: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Core features missing */
const SOLUTIONS_CORE_FEATURES_MISSING: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.FIND_GUIDES },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Too slow */
const SOLUTIONS_TOO_SLOW: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.MAKE_SITE_FASTER },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Bugs or glitches */
const SOLUTIONS_BUGS_OR_GLITCHES: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Migration problems */
const SOLUTIONS_MIGRATION_PROBLEMS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.USE_MIGRATION_TOOLS },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Downtime */
const SOLUTIONS_DOWNTIME: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Trouble connecting or transferring (domain) */
const SOLUTIONS_TROUBLE_CONNECTING_OR_TRANSFERRING: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.USE_DOMAIN_GUIDE },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Confused about domains */
const SOLUTIONS_CONFUSED_ABOUT_DOMAINS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.USE_DOMAIN_GUIDE },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Domain incorrect */
const SOLUTIONS_DOMAIN_INCORRECT: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.EXPLORE_DOMAIN_OPTIONS },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Wrong plan */
const SOLUTIONS_WRONG_PLAN: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.SWITCH_TO_MONTHLY },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Wrong site */
const SOLUTIONS_WRONG_SITE: SolutionCardConfig[] = [ { id: SOLUTION_IDS.SPEAK_WITH_SUPPORT } ];

/** Plan didn't match (noMatch) */
const SOLUTIONS_NO_MATCH: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SWITCH_TO_MONTHLY },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Slow or unhelpful support */
const SOLUTIONS_SLOW_OR_UNHELPFUL: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.FIND_GUIDES },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** No human support */
const SOLUTIONS_NO_HUMAN_SUPPORT: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.FIND_GUIDES },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** AI insufficient */
const SOLUTIONS_AI_INSUFFICIENT: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.FIND_GUIDES },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Project changed */
const SOLUTIONS_PROJECT_CHANGED: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** Just exploring */
const SOLUTIONS_JUST_EXPLORING: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** May return */
const SOLUTIONS_MAY_RETURN: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
];

/** No longer need site / other changed needs */
const SOLUTIONS_NO_LONGER_NEED: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.CHANGE_PLAN },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT },
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

		// Missing features / limitations
		case 'cannotInstallPlugins':
			return [ ...SOLUTIONS_CANNOT_INSTALL_PLUGINS ];
		case 'cannotUploadThemes':
			return [ ...SOLUTIONS_CANNOT_UPLOAD_THEMES ];
		case 'limitedCustomization':
			return [ ...SOLUTIONS_LIMITED_CUSTOMIZATION ];
		case 'missingFunctionality':
			return [ ...SOLUTIONS_MISSING_FUNCTIONALITY ];
		case 'coreFeaturesMissing':
			return [ ...SOLUTIONS_CORE_FEATURES_MISSING ];

		// Performance / reliability
		case 'tooSlow':
			return [ ...SOLUTIONS_TOO_SLOW ];
		case 'bugsOrGlitches':
			return [ ...SOLUTIONS_BUGS_OR_GLITCHES ];
		case 'migrationProblems':
			return [ ...SOLUTIONS_MIGRATION_PROBLEMS ];
		case 'downtime':
			return [ ...SOLUTIONS_DOWNTIME ];

		// Domain-related
		case 'troubleConnectingOrTransferring':
			return [ ...SOLUTIONS_TROUBLE_CONNECTING_OR_TRANSFERRING ];
		case 'confusedAboutDomains':
			return [ ...SOLUTIONS_CONFUSED_ABOUT_DOMAINS ];
		case 'domainIncorrect':
			return [ ...SOLUTIONS_DOMAIN_INCORRECT ];

		// Wrong plan or site
		case 'wrongPlan':
			return [ ...SOLUTIONS_WRONG_PLAN ];
		case 'wrongSite':
			return [ ...SOLUTIONS_WRONG_SITE ];
		case 'noMatch':
			return [ ...SOLUTIONS_NO_MATCH ];

		// Bad support experience
		case 'slowOrUnhelpful':
			return [ ...SOLUTIONS_SLOW_OR_UNHELPFUL ];
		case 'noHumanSupport':
			return [ ...SOLUTIONS_NO_HUMAN_SUPPORT ];
		case 'AIInsufficient':
			return [ ...SOLUTIONS_AI_INSUFFICIENT ];

		// Other / lifecycle
		case 'projectChanged':
			return [ ...SOLUTIONS_PROJECT_CHANGED ];
		case 'justExploring':
			return [ ...SOLUTIONS_JUST_EXPLORING ];
		case 'mayReturn':
			return [ ...SOLUTIONS_MAY_RETURN ];

		// No longer need site
		case 'noLongerNeedSite':
		case 'otherNoLongerNeedSite':
			return [ ...SOLUTIONS_NO_LONGER_NEED ];

		default:
			return null;
	}
}
