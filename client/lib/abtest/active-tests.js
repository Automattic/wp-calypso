/** @format */
export default {
	improvedOnboarding: {
		datestamp: '20181023',
		variations: {
			main: 90,
			onboarding: 10,
		},
		defaultVariation: 'main',
		localeTargets: 'any',
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
	simplifiedChecklistView: {
		datestamp: '20181204',
		variations: {
			showAll: 50,
			showFirstOnly: 50,
		},
		defaultVariation: 'showAll',
	},
	removeUsername: {
		datestamp: '20181213',
		variations: {
			showUsername: 50,
			hideUsername: 50,
		},
		defaultVariation: 'showUsername',
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
	privateByDefault: {
		datestamp: '20181217',
		variations: {
			private: 10,
			public: 90,
		},
		defaultVariation: 'public',
	},
};
