module.exports = {
	// `browserNotifications` controls whether or not users see the
	// nudge notice to enable browser notifications at the top of
	// some Calypso screens; any users with this enabled will also
	// have the preference available in /me/notifications;
	// note: not renaming this test at this point in time so that we don't
	// mess with any users that were put in the `enabled` variation -- don't
	// want to take their browser notifications preference away from them!
	browserNotifications: {
		datestamp: '20160628',
		variations: {
			disabled: 95,
			enabled: 5,
		},
		defaultVariation: 'disabled',
		allowExistingUsers: true,
	},
	multiDomainRegistrationV1: {
		datestamp: '20200721',
		variations: {
			singlePurchaseFlow: 10,
			popupCart: 45,
			keepSearchingInGapps: 45
		},
		defaultVariation: 'singlePurchaseFlow'
	},
	signupStore: {
		datestamp: '20160927',
		variations: {
			designTypeWithoutStore: 0,
			designTypeWithStore: 100,
		},
		defaultVariation: 'designTypeWithStore',
		allowExistingUsers: false,
	},
	signupStoreBenchmarking: {
		datestamp: '20160927',
		variations: {
			pressable: 97,
			bluehost: 1,
			bluehostWithWoo: 1,
			siteground: 1
		},
		defaultVariation: 'pressable',
		allowExistingUsers: false,
	},
	signupThemeUpload: {
		datestamp: '20160928',
		variations: {
			showThemeUpload: 10,
			hideThemeUpload: 90,
		},
		defaultVariation: 'hideThemeUpload',
		allowExistingUsers: false,
	},
	domainSuggestionPopover: {
		datestamp: '20160809',
		variations: {
			showPopover: 80,
			hidePopover: 20,
		},
		defaultVariation: 'showPopover',
		allowExistingUsers: false,
	},
	designShowcaseWelcomeTour: {
		datestamp: '20161206',
		variations: {
			enabled: 0,
			disabled: 100,
		},
		defaultVariation: 'disabled',
		allowExistingUsers: true,
	},
	themeSheetWelcomeTour: {
		datestamp: '20161206',
		variations: {
			enabled: 0,
			disabled: 100,
		},
		defaultVariation: 'disabled',
		allowExistingUsers: true,
	},
	siteTitleStep: {
		datestamp: '20170102',
		variations: {
			showSiteTitleStep: 5,
			hideSiteTitleStep: 95,
		},
		defaultVariation: 'hideSiteTitleStep',
		allowExistingUsers: false
	},

	jetpackConnectPlansFirst: {
		datestamp: '20161024',
		variations: {
			showPlansBeforeAuth: 50,
			showPlansAfterAuth: 50
		},
		defaultVariation: 'showPlansAfterAuth',
		allowExistingUsers: true
	},

	siteTitleTour: {
		datestamp: '20161207',
		variations: {
			disabled: 100,
			enabled: 0,
		},
		defaultVariation: 'disabled',
		allowExistingUsers: true,
	},

	userFirstSignup: {
		datestamp: '20160124',
		variations: {
			userLast: 80,
			userFirst: 20,
		},
		defaultVariation: 'userLast',
		allowExistingUsers: false,
	},

	premiumSquaredPlansWording: {
		datestamp: '20170111',
		variations: {
			withoutMarketingCopy: 50,
			withMarketingCopy: 50
		},
		defaultVariation: 'withoutMarketingCopy',
		allowExistingUsers: true
	},

	jetpackPlansTabs: {
		datestamp: '20170117',
		variations: {
			tabs: 50,
			noTabs: 50
		},
		defaultVariation: 'noTabs'
	},

	domainContactNewPhoneInput: {
		datestamp: '20170123',
		variations: {
			disabled: 50,
			enabled: 50
		},
		defaultVariation: 'disabled',
		allowExistingUsers: true
	},

	boostedPostSurvey: {
		datestamp: '20170127',
		variations: {
			disabled: 90,
			enabled: 10
		},
		defaultVariation: 'disabled',
		allowExistingUsers: true
	}
};
