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
	verticalSurvey: {
		datestamp: '20151210',
		variations: {
			noSurvey: 12,
			oneStep: 44,
			twoStep: 44
		},
		defaultVariation: 'noSurvey'
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
		datestamp: '20151221',
		variations: {
			originalA: 50,
			originalB: 50
		},
		defaultVariation: 'originalA'
	},
	businessPluginsNudge: {
		datestamp: '20151119',
		variations: {
			drake: 50,
			nudge: 50
		},
		defaultVariation: 'drake'
	},
	dss: {
		datestamp: '20151210',
		variations: {
			main: 15,
			dss: 15,
			notTested: 70
		},
		defaultVariation: 'main'
	},
	triforce: {
		datestamp: '20151216',
		variations: {
			main: 40,
			triforce: 40,
			notTested: 20
		},
		defaultVariation: 'main'
	},
	autoFillUsernameSignup: {
		datestamp: '20151216',
		variations: {
			autoFill: 50,
			dontAutoFill: 50
		},
		defaultVariation: 'dontAutoFill'
	},
	catchJsErrors: {
		datestamp: '20151223',
		variations: {
			original: 99,
			catchJsErrors: 1
		},
		defaultVariation: 'original'
	}
};
