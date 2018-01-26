/** @format */
export default {
	multiDomainRegistrationV1: {
		datestamp: '20200721',
		variations: {
			singlePurchaseFlow: 10,
			popupCart: 45,
			keepSearchingInGapps: 45,
		},
		defaultVariation: 'singlePurchaseFlow',
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
	unlimitedThemeNudge: {
		datestamp: '20171016',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	signupSiteSegmentStep: {
		datestamp: '20170329',
		variations: {
			control: 0,
			variant: 100,
		},
		defaultVariation: 'control',
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
	gsuiteUpsellV2: {
		datestamp: '20171225',
		variations: {
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
	},

	// Must run at least 1 full week from commit time
	// 2018-01-24 to 2018-01-31
	promoteYearlyJetpackPlanSavings: {
		datestamp: '20180124',
		variations: {
			original: 50,
			promoteYearly: 50,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
	},
};
