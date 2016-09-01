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
		datestamp: '20160904',
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
	signupCheckoutRedirect: {
		datestamp: '20160826',
		variations: {
			auto: 50,
			manual: 50,
		},
		defaultVariation: 'manual',
		allowExistingUsers: false,
	},
	signupStore: {
		datestamp: '20160727',
		variations: {
			designTypeWithoutStore: 80,
			designTypeWithStore: 20,
		},
		defaultVariation: 'designTypeWithoutStore',
		allowExistingUsers: false,
	},
	signupStoreBenchmarking: {
		datestamp: '20160817',
		variations: {
			pressable: 94,
			bluehost: 2,
			bluehostWithWoo: 2,
			siteground: 2
		},
		defaultVariation: 'pressable',
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
	plansWording: {
		datestamp: '20160817',
		variations: {
			originalWording: 50,
			targetedWording: 50
		},
		defaultVariation: 'originalWording'
	},
	paidNuxStreamlined: {
		datestamp: '20160912',
		variations: {
			original: 100,
			streamlined: 0,
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
