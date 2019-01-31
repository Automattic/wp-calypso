/** @format */
export default {
	improvedOnboarding: {
		datestamp: '20190131',
		variations: {
			main: 50,
			onboarding: 50,
		},
		defaultVariation: 'main',
	},
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
	jetpackFreePlanButtonPosition: {
		datestamp: '20181212',
		variations: {
			locationTop: 50,
			locationBottom: 50,
		},
		defaultVariation: 'locationBottom',
		allowExistingUsers: true,
	},
	showConciergeSessionUpsell: {
		datestamp: '20181214',
		variations: {
			skip: 100,
			show: 0,
		},
		defaultVariation: 'skip',
		allowExistingUsers: true,
	},
	showConciergeSessionUpsellNonGSuite: {
		datestamp: '20181228',
		variations: {
			skip: 50,
			show: 50,
		},
		defaultVariation: 'skip',
		allowExistingUsers: true,
	},
	builderReferralStatsNudge: {
		datestamp: '20181218',
		variations: {
			builderReferralBanner: 25,
			googleMyBusinessBanner: 75,
		},
		defaultVariation: 'googleMyBusinessBanner',
	},
	privateByDefault: {
		datestamp: '20181217',
		variations: {
			private: 0,
			public: 100,
		},
		defaultVariation: 'public',
	},
	builderReferralThemesBanner: {
		datestamp: '20181218',
		variations: {
			builderReferralBanner: 25,
			original: 75,
		},
		defaultVariation: 'original',
	},
	removeDomainsStepFromOnboarding: {
		datestamp: '20181221',
		variations: {
			keep: 100,
			remove: 0,
		},
		defaultVariation: 'keep',
	},
	gSuitePlan: {
		datestamp: '20190117',
		variations: {
			basic: 90,
			business: 10,
		},
		defaultVariation: 'basic',
	},
	domainSearchButtonStyles: {
		datestamp: '20190119',
		variations: {
			allPrimary: 50,
			onePrimary: 50,
		},
		defaultVariation: 'allPrimary',
	},
};
