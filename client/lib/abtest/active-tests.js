/** @format */
export default {
	multiyearSubscriptions: {
		datestamp: '20180417',
		variations: {
			show: 50,
			hide: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	springSale30PercentOff: {
		datestamp: '20180413',
		variations: {
			upsell: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
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
	mobilePlansTablesOnSignup: {
		datestamp: '20180330',
		variations: {
			original: 50,
			vertical: 50,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
	},
	jetpackSignupGoogleTop: {
		datestamp: '20180427',
		variations: {
			original: 50,
			top: 50,
		},
		defaultVariation: 'original',
	},
	domainSearchFilterOnClose: {
		datestamp: '20180524',
		variations: {
			disabled: 50,
			enabled: 50,
		},
		defaultVariation: 'disabled',
	},
	domainSuggestionKrakenV321: {
		datestamp: '20180524',
		variations: {
			domainsbot: 1,
			group_1: 10000,
			group_3: 10000,
			group_4: 10000,
		},
		defaultVariation: 'domainsbot',
	},
};
