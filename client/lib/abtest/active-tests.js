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
	userFirstSignup: {
		datestamp: '20160124',
		variations: {
			userLast: 100,
			userFirst: 0,
		},
		defaultVariation: 'userLast',
		allowExistingUsers: false,
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
	jetpackNewDescriptions: {
		datestamp: '20170327',
		variations: {
			showNew: 0,
			showOld: 100 /* test completed. I'm disabling it here first because
						it need some work to remove the added code for the
						new variation that's not going to be used */
		},
		defaultVariation: 'showOld',
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
};
