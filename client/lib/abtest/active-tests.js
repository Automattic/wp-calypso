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
		datestamp: '20160328',
		variations: {
			disabled: 85,
			enabled: 15
		},
		defaultVariation: 'disabled'
	},
	freeTrialNudgeOnThankYouPage: {
		datestamp: '20160328',
		variations: {
			disabled: 50,
			enabled: 50
		},
		defaultVariation: 'disabled'
	},
	monthlyPlanPricing: {
		datestamp: '20160118',
		variations: {
			yearly: 50,
			monthly: 50
		},
		defaultVariation: 'yearly'
	},
	privacyCheckbox: {
		datestamp: '20160310',
		variations: {
			original: 50,
			checkbox: 50
		},
		defaultVariation: 'original'
	},
	verticalThemes: {
		datestamp: '20160324',
		variations: {
			original: 25,
			verticalThemes: 25,
			notTested: 50
		},
		defaultVariation: 'original'
	},
};
