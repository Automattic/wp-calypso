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
	plansPageBusinessAATest: {
		datestamp: '20160108',
		variations: {
			originalA: 50,
			originalB: 50
		},
		defaultVariation: 'originalA'
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
	checkoutFooter: {
		datestamp: '20160215',
		variations: {
			original: 50,
			noFooter: 50
		},
		defaultVariation: 'original'
	},
	domainSearchResultsCount: {
		datestamp: '20160223',
		variations: {
			original: 50,
			moreResults: 50
		},
		defaultVariation: 'original'
	},
	domainSearchPlaceholderText: {
		datestamp: '20160304',
		variations: {
			original: 50,
			searchForADomain: 50
		},
		defaultVariation: 'original'
	},
	sidebarOnCheckoutOfOneProduct: {
		datestamp: '20160308',
		variations: {
			original: 50,
			hidden: 50,
		},
		defaultVariation: 'original'
	},
	privacyCheckbox: {
		datestamp: '20160310',
		variations: {
			original: 50,
			checkbox: 50
		},
		defaultVariation: 'original'
	},
	readerShorterFeatures2: {
		datestamp: '20160315',
		variations: {
			original: 80,
			fifty: 10,
			twentyfive: 10
		},
		defaultVariation: 'original',
		allowAnyLocale: true,
		allowExistingUsers: true
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
