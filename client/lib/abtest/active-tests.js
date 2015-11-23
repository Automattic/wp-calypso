module.exports = {
	statsDefaultFilter: {
		datestamp: '20150601',
		variations: {
			day: 90,
			insights: 10
		},
		defaultVariation: 'day'
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
		datestamp: '20151104',
		variations: {
			originalA: 50,
			originalB: 50
		},
		defaultVariation: 'originalA'
	},
	nuxTrampoline: {
		datestamp: '20151113',
		variations: {
			main: 10,
			'landing-main': 10,
			notTested: 80
		},
		defaultVariation: 'main'
	},
	businessPluginsNudge: {
		datestamp: '20151119',
		variations: {
			drake: 50,
			nudge: 50
		},
		defaultVariation: 'drake'
	},
};
