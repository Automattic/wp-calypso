module.exports = {
	multiDomainRegistrationV1: {
		datestamp: '20200721',
		variations: {
			singlePurchaseFlow: 10,
			popupCart: 45,
			keepSearchingInGapps: 45
		},
		defaultVariation: 'singlePurchaseFlow'
	},
	translatorInvitation: {
		datestamp: '20150910',
		variations: {
			noNotice: 1,
			startNow: 1,
			helpUs: 1,
			tryItNow: 1,
			startTranslating: 1,
			improve: 1
		},
		defaultVariation: 'noNotice',
		allowAnyLocale: true
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
	freeTrialNudgeOnThankYouPage: {
		datestamp: '20200328',
		variations: {
			disabled: 50,
			enabled: 50
		},
		defaultVariation: 'disabled'
	},
	domainSuggestionVendor: {
		datestamp: '20160614',
		variations: {
			namegen: 50,
			domainsbot: 50
		},
		defaultVariation: 'namegen'
	},
	domainCreditsInfoNotice: {
		datestamp: '20160420',
		variations: {
			showNotice: 90,
			original: 10
		},
		defaultVariation: 'showNotice',
		allowExistingUsers: true,
		allowAnyLocale: true
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
	browserNotifications: {
		datestamp: '20160628',
		variations: {
			disabled: 95,
			enabled: 5,
		},
		defaultVariation: 'disabled',
		allowExistingUsers: true,
	},
	signupStore: {
		datestamp: '20160707',
		variations: {
			designTypeWithoutStore: 80,
			designTypeWithStore: 20,
		},
		defaultVariation: 'designTypeWithoutStore',
		allowExistingUsers: false,
	},
};
