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
		datestamp: '20160804',
		variations: {
			noEmailColdStart: 20,
			noChanges: 80
		},
		defaultVariation: 'noChanges',
		allowExistingUsers: false,
	},
	domainSuggestionVendor: {
		datestamp: '20160614',
		variations: {
			namegen: 50,
			domainsbot: 50
		},
		defaultVariation: 'namegen'
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
	signupThemePreview: {
		datestamp: '20160727',
		variations: {
			showThemePreview: 20,
			hideThemePreview: 80,
		},
		defaultVariation: 'hideThemePreview',
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
		datestamp: '20160825',
		variations: {
			original: 100,
			streamlined: 0,
		},
		defaultVariation: 'original',
	},
};
