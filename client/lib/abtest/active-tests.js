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
	// `browserNotificationsPreferences` controls whether or not users see the
	// preference to enable browser notifications in /me/notifications;
	// any users with `browserNotifications` enabled will also see the preference;
	// this is a temporary test just to allow us to ramp up the load gradually so
	// that make sure things will be smooth when we go to launching browser
	// notifications for 100% of users
	browserNotificationsPreferences: {
		datestamp: '20160801',
		variations: {
			disabled: 60,
			enabled: 40,
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
	freeTrialNudgeOnThankYouPage: {
		datestamp: '20200328',
		variations: {
			disabled: 50,
			enabled: 50
		},
		defaultVariation: 'disabled'
	},
	freeTrialsInSignup: {
		datestamp: '20200328',
		variations: {
			disabled: 40,
			enabled: 15,
			notTested: 45
		},
		defaultVariation: 'disabled'
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
	firstView: {
		datestamp: '20160726',
		variations: {
			disabled: 60,
			enabled: 40,
		},
		defaultVariation: 'disabled',
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
	}
};
