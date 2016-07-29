module.exports = {
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
		datestamp: '20160622',
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
			disabled: 95,
			enabled: 5,
		},
		defaultVariation: 'disabled',
		allowExistingUsers: false,
	}
};
