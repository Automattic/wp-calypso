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
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
	},
	automatedTransfer2: {
		datestamp: '20170316',
		variations: {
			enabled: 100,
			disabled: 0
		},
		defaultVariation: 'disabled',
		allowExistingUsers: false
	},
	jetpackNoMonthly: {
		datestamp: '20170410',
		variations: {
			showMonthly: 50,
			dontShowMonthly: 50
		},
		defaultVariation: 'showMonthly',
		allowExistingUsers: true
	},
	signupSurveyStep: {
		datestamp: '20170329',
		variations: {
			showSurveyStep: 20,
			hideSurveyStep: 80,
		},
		defaultVariation: 'hideSurveyStep',
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
};
