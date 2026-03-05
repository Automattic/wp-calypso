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
	UPGRADE_FULL_ACCESS: 'upgrade-for-full-access',
	GET_THEME_ADDON: 'get-theme-addon',
	GET_CSS_ADDON: 'get-css-addon',
	FIND_GUIDES: 'find-guides',
	MAKE_SITE_FASTER: 'make-site-faster',
	USE_MIGRATION_TOOLS: 'use-migration-tools',
	USE_DOMAIN_GUIDE: 'use-domain-guide',
	EXPLORE_DOMAIN_OPTIONS: 'explore-domain-options',
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

/** Cannot install plugins */
const SOLUTIONS_CANNOT_INSTALL_PLUGINS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.UPGRADE_FULL_ACCESS, label: 'Upgrade for full access' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Cannot upload themes */
const SOLUTIONS_CANNOT_UPLOAD_THEMES: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.UPGRADE_FULL_ACCESS, label: 'Upgrade for full access' },
	{ id: SOLUTION_IDS.GET_THEME_ADDON, label: 'Get our theme add-on' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Limited customization */
const SOLUTIONS_LIMITED_CUSTOMIZATION: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.UPGRADE_FULL_ACCESS, label: 'Upgrade for full access' },
	{ id: SOLUTION_IDS.GET_CSS_ADDON, label: 'Get our CSS add-on' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Missing functionality */
const SOLUTIONS_MISSING_FUNCTIONALITY: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.UPGRADE_FULL_ACCESS, label: 'Upgrade for full access' },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT, label: 'Ask our AI assistant' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Core features missing */
const SOLUTIONS_CORE_FEATURES_MISSING: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.FIND_GUIDES, label: 'Find easy step-by-step guides' },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT, label: 'Ask our AI assistant' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Too slow */
const SOLUTIONS_TOO_SLOW: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.MAKE_SITE_FASTER, label: 'Make your site faster' },
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS, label: 'Renew now and pay less' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Bugs or glitches */
const SOLUTIONS_BUGS_OR_GLITCHES: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS, label: 'Renew now and pay less' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Migration problems */
const SOLUTIONS_MIGRATION_PROBLEMS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.USE_MIGRATION_TOOLS, label: 'Use our migration tools' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Downtime */
const SOLUTIONS_DOWNTIME: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.RENEW_NOW_PAY_LESS, label: 'Renew now and pay less' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Trouble connecting or transferring (domain) */
const SOLUTIONS_TROUBLE_CONNECTING_OR_TRANSFERRING: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.USE_DOMAIN_GUIDE, label: 'Use our domain guide' },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT, label: 'Ask our AI assistant' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Confused about domains */
const SOLUTIONS_CONFUSED_ABOUT_DOMAINS: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.USE_DOMAIN_GUIDE, label: 'Use our domain guide' },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT, label: 'Ask our AI assistant' },
	{ id: SOLUTION_IDS.SPEAK_WITH_SUPPORT, label: 'Speak with our support team' },
];

/** Domain incorrect */
const SOLUTIONS_DOMAIN_INCORRECT: SolutionCardConfig[] = [
	{ id: SOLUTION_IDS.EXPLORE_DOMAIN_OPTIONS, label: 'Explore more domain options' },
	{ id: SOLUTION_IDS.ASK_AI_ASSISTANT, label: 'Ask our AI assistant' },
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

		default:
			return null;
	}
}
