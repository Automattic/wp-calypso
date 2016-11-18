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
	domainSuggestionClickableRow: {
		datestamp: '20160802',
		variations: {
			clickableRow: 20,
			clickableButton: 80
		},
		defaultVariation: 'clickableButton'
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
	domainDotBlogSubdomain: {
		datestamp: '20161118',
		variations: {
			excludeDotBlogSubdomain: 90,
			includeDotBlogSubdomain: 10,
		},
		defaultVariation: 'excludeDotBlogSubdomain',
		allowAnyLocale: true,
	},
	paidNuxThankYouPage: {
		datestamp: '20161114',
		variations: {
			original: 50,
			emailNudgeOnTop: 50,
		},
		defaultVariation: 'original',
	},
	siteTitleStep: {
		datestamp: '20160928',
		variations: {
			showSiteTitleStep: 5,
			hideSiteTitleStep: 95,
		},
		defaultVariation: 'hideSiteTitleStep',
		allowExistingUsers: false
	},
	domainToPersonalPlanNudge3: {
		datestamp: '20161109',
		variations: {
			original: 50,
			nudge: 50
		},
		defaultVariation: 'original',
		allowExistingUsers: true
	},

	gSuiteOnSignup: {
		datestamp: '20161025',
		variations: {
			original: 50,
			removed: 50
		},
		defaultVariation: 'original',
		allowExistingUsers: true
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
};

