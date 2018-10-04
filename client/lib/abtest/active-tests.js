/** @format */
export default {
	cartNudgeUpdateToPremium: {
		datestamp: '20180917',
		variations: {
			test: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
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
	jetpackSignupGoogleTop: {
		datestamp: '20180427',
		variations: {
			original: 50,
			top: 50,
		},
		defaultVariation: 'original',
	},
	includeDotBlogSubdomainV2: {
		datestamp: '20180813',
		variations: {
			yes: 50,
			no: 50,
		},
		defaultVariation: 'no',
	},
	gSuiteDiscountV2: {
		datestamp: '20180822',
		variations: {
			control: 100,
			discount: 0,
		},
		defaultVariation: 'control',
	},
	readerSearchPlaceholder: {
		datestamp: '20180830',
		variations: {
			justSearch: 34,
			nextGreatRead: 33,
			newFavorite: 33,
		},
		defaultVariation: 'justSearch',
	},
	domainManagementSuggestionV2: {
		datestamp: '20181001',
		variations: {
			domainsbot_front: 80,
			variation_front: 20,
		},
		defaultVariation: 'domainsbot_front',
		assignmentMethod: 'userId',
		allowExistingUsers: true,
	},
	userFirstSignup: {
		datestamp: '20180913',
		variations: {
			default: 1,
			userFirst: 1,
		},
		defaultVariation: 'default',
		allowExistingUsers: false,
	},
	dotBlogSuggestions: {
		datestamp: '20181001',
		variations: {
			simple: 50,
			complex: 50,
		},
		defaultVariation: 'simple',
		allowExistingUsers: true,
	},
};
