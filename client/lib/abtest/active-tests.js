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
	monthlyPlanPricing: {
		datestamp: '20160118',
		variations: {
			yearly: 50,
			monthly: 50
		},
		defaultVariation: 'yearly'
	},
	plansUpgradeButton: {
		datestamp: '20160212', // Update to the day of deploy
		variations: {
			original: 20,
			free: 20,
			add: 20,
			info: 20,
			change: 20
		},
		defaultVariation: 'original'
	},
	plansSocialProof: {
		datestamp: '20160202',
		variations: {
			mostPopular: 33,
			bestValue: 33,
			noTeaser: 34
		},
		defaultVariation: 'mostPopular'
	},
	plansFeatureList: {
		datestamp: '20040202',
		variations: {
			list: 50,
			description: 50
		},
		defaultVariation: 'description'
	},
	headstart: {
		datestamp: '20160205',
		variations: {
			original: 20,
			notTested: 60,
			headstart: 20
		},
		defaultVariation: 'original'
	},
};
