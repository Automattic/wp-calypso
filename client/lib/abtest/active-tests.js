/** @format */
export default {
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
	jetpackSignupGoogleTop: {
		datestamp: '20180427',
		variations: {
			original: 50,
			top: 50,
		},
		defaultVariation: 'original',
	},
	domainSuggestionKrakenV322: {
		datestamp: '20180709',
		variations: {
			domainsbot: 0,
			group_1: 27200,
			group_3: 27200,
			group_4: 27200,
			group_6: 1000,
			group_7: 1000,
			group_8: 27200,
		},
		defaultVariation: 'domainsbot',
	},
	domainSearchTLDFilterPlacement: {
		datestamp: '20180531',
		variations: {
			belowFeatured: 50,
			aboveFeatured: 50,
		},
		defaultVariation: 'belowFeatured',
	},
	staleCartNotice: {
		datestamp: '20180618',
		variations: {
			siteDeservesBoost: 50,
			cartAwaitingPayment: 50,
		},
		defaultVariation: 'siteDeservesBoost',
	},
	aboutSuggestionMatches: {
		datestamp: '20180704',
		variations: {
			control: 50,
			enhancedSort: 50,
		},
		defaultVariation: 'control',
	},
};
