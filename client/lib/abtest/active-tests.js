/** @format */
export default {
	signupAtomicStoreVsPressable: {
		datestamp: '20171101',
		variations: {
			atomic: 99,
			pressable: 1,
		},
		defaultVariation: 'atomic',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	businessPlanDescriptionAT: {
		datestamp: '20170605',
		variations: {
			original: 50,
			pluginsAndThemes: 50,
		},
		defaultVariation: 'original',
	},
	ATPromptOnCancel: {
		datestamp: '20170515',
		variations: {
			hide: 20,
			show: 80,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	ATUpgradeOnCancel: {
		datestamp: '20170515',
		variations: {
			hide: 20,
			show: 80,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	skipThemesSelectionModal: {
		datestamp: '20170904',
		variations: {
			skip: 50,
			show: 50,
		},
		defaultVariation: 'show',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	checklistThankYouForFreeUser: {
		datestamp: '20171204',
		variations: {
			show: 50,
			hide: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	checklistThankYouForPaidUser: {
		datestamp: '20171204',
		variations: {
			show: 50,
			hide: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	domainSuggestionTestV6: {
		datestamp: '20180315',
		variations: {
			group_0: 1, // Default group
			group_1: 1000,
			group_2: 1000,
			group_3: 1000,
			group_4: 1000,
		},
		defaultVariation: 'group_0',
		allowExistingUsers: true,
	},
	minimizedFreePlanForUnsignedUser: {
		datestamp: '20180308',
		variations: {
			original: 50,
			minimized: 50,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
	},
	upgradePricingDisplayV2: {
		datestamp: '20180305',
		variations: {
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
	},
	domainSearchPrefill: {
		datestamp: '20180315',
		variations: {
			noPrefill: 50,
			withSiteTitle: 50,
		},
		defaultVariation: 'noPrefill',
		allowExistingUsers: true,
	},
	redesignedSidebarBanner: {
		datestamp: '20180222',
		variations: {
			newBanner: 50,
			oldBanner: 50,
		},
		defaultVariation: 'oldBanner',
	},
	siteGoalsShuffle: {
		datestamp: '20180214',
		variations: {
			control: 50,
			variant: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	inlineHelpWithContactForm: {
		datestamp: '20180306',
		variations: {
			original: 90,
			inlinecontact: 10,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
	},
};
