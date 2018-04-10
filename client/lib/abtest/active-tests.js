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
	upgradePricingDisplayV2: {
		datestamp: '20180305',
		variations: {
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
	},
	redesignedSidebarBanner: {
		datestamp: '20180222',
		variations: {
			newBanner: 50,
			oldBanner: 50,
		},
		defaultVariation: 'oldBanner',
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
	showMoneyBackGuarantee: {
		datestamp: '20180409',
		variations: {
			no: 1,
			yes: 1,
		},
		defaultVariation: 'no',
	},
};
