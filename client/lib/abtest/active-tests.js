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
	coldStartReader: {
		datestamp: '20160901',
		variations: {
			noEmailColdStart: 33,
			noEmailColdStartWithAutofollows: 33,
			noChanges: 34
		},
		defaultVariation: 'noChanges',
		allowExistingUsers: false,
	},
	domainSuggestionClickableRow: {
		datestamp: '20160802',
		variations: {
			clickableRow: 20,
			clickableButton: 80
		},
		defaultVariation: 'clickableButton'
	},
	expandedNudge: {
		datestamp: '20160927',
		variations: {
			expanded: 50,
			regular: 50,
		},
		defaultVariation: 'regular',
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
	plansDescriptions: {
		datestamp: '20160826',
		variations: {
			ascendingPriceSubtleDescription: 25,
			ascendingPriceEagerDescription: 25,
			descendingPriceSubtleDescription: 25,
			descendingPriceEagerDescription: 25
		},
		defaultVariation: 'ascendingPriceSubtleDescription',
		allowExistingUsers: false,
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
		datestamp: '20160825',
		variations: {
			showThemeUpload: 10,
			hideThemeUpload: 90,
		},
		defaultVariation: 'hideThemeUpload',
		allowExistingUsers: false,
	},
	readerSearchSuggestions: {
		datestamp: '20160804',
		variations: {
			staffSuggestions: 50,
			popularSuggestions: 50
		},
		defaultVariation: 'staffSuggestions',
		allowExistingUsers: true
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
	paidNuxStreamlined: {
		datestamp: '20160912',
		variations: {
			original: 50,
			streamlined: 50,
		},
		defaultVariation: 'original',
	},
	verticalScreenshots: {
		datestamp: '20160902',
		variations: {
			showVerticalScreenshots: 50,
			hideVerticalScreenshots: 50,
		},
		defaultVariation: 'hideVerticalScreenshots',
	}
};
