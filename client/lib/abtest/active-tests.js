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
	signupPlansCallToAction: {
		datestamp: '20170403',
		variations: {
			original: 0,
			modified: 100, // Setting to 100% until strings are translated
		},
		defaultVariation: 'original',
	},
	signupSurveyStep: {
		datestamp: '20170329',
		variations: {
			showSurveyStep: 20,
			hideSurveyStep: 80,
		},
		defaultVariation: 'hideSurveyStep',
	},
	signupPlansReorderTest: {
		datestamp: '20170410',
		variations: {
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
	},
	conciergeOfferOnCancel: {
		datestamp: '20170410',
		variations: {
			showConciergeOffer: 50,
			hideConciergeOffer: 50,
		},
		defaultVariation: 'showConciergeOffer',
	},
	presaleChatButton: {
		datestamp: '20170328',
		variations: {
			showChatButton: 20,
			original: 80
		},
		defaultVariation: 'original',
		allowAnyLocale: true,
	},
	newSiteWithJetpack: {
		datestamp: '20170419',
		variations: {
			showNewJetpackSite: 10,
			onlyDotComSites: 90,
		},
		defaultVariation: 'onlyDotComSites',
	},
	chatOfferOnCancel: {
		datestamp: '20170421',
		variations: {
			show: 50,
			hide: 50,
		},
		defaultVariation: 'show',
		allowExistingUsers: true,
	},
	domainToPaidPlanUpsellNudge: {
		datestamp: '20170429',
		variations: {
			skip: 50,
			show: 50,
		},
		defaultVariation: 'skip',
	},
	jetpackPlansHeadlines: {
		datestamp: '20170508',
		variations: {
			headlineA: 25,
			headlineB: 25,
			headlineC: 25,
			headlineD: 25
		},
		defaultVariation: 'headlineA',
	},
};
