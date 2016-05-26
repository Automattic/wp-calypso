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
	privacyCheckbox: {
		datestamp: '20160310',
		variations: {
			original: 50,
			checkbox: 50
		},
		defaultVariation: 'original'
	},
	domainSuggestionVendor: {
		datestamp: '20160520',
		variations: {
			namegen: 75,
			domainsbot: 25,
		},
		defaultVariation: 'namegen'
	},
	nudges: {
		datestamp: '20160519',
		variations: {
			showAll: 60,
			hideAll: 40
		},
		defaultVariation: 'showAll'
	},
	guidedTours: {
		datestamp: '20160428',
		variations: {
			original: 96,
			guided: 2,
			calypsoOnly: 2
		},
		defaultVariation: 'original',
		allowExistingUsers: true
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
	domainsWithPlansOnly: {
		datestamp: '20160517', // was 20160427
		variations: {
			original: 0,
			plansOnly: 100
		},
		defaultVariation: 'original',
		allowExistingUsers: false,
		allowAnyLocale: true
	},
	planPricing: {
		datestamp: '20160426',
		variations: {
			monthly: 90,
			annual: 10
		},
		defaultVariation: 'monthly',
		allowExistingUsers: true,
		allowAnyLocale: true
	}
};
