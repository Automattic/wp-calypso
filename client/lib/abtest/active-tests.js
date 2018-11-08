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
	jetpackSignupGoogleTop: {
		datestamp: '20180427',
		variations: {
			original: 50,
			top: 50,
		},
		defaultVariation: 'original',
	},
	krackenRebootM33: {
		datestamp: '20181108',
		variations: {
			domainsbot_front: 25,
			variation1_front: 25,
			variation2_front: 25,
			variation3_front: 25,
		},
		defaultVariation: 'domainsbot_front',
		assignmentMethod: 'userId',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
};
