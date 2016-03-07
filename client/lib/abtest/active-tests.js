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
	freeTrials: {
		datestamp: '20160120',
		variations: {
			notOffered: 90,
			offered: 10
		},
		defaultVariation: 'notOffered'
	},
	plansFeatureList: {
		datestamp: '20160215',
		variations: {
			list: 33,
			andMore: 33,
			description: 34
		},
		defaultVariation: 'description'
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
	promoteFreeDomain: {
		datestamp: '20160302',
		variations: {
			original: 50,
			freeDomain: 50
		},
		defaultVariation: 'original',
		excludeSitesWithPaidPlan: true
	},
	domainSearchPlaceholderText: {
		datestamp: '20160304',
		variations: {
			original: 50,
			searchForADomain: 50
		},
		defaultVariation: 'original'
	},
};
