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
	signupStepOneMobileOptimize: {
		datestamp: '20170322',
		variations: {
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
	},
	readerPostCardTagCount: {
		datestamp: '20170315',
		variations: {
			showOne: 50,
			showThree: 50
		},
		defaultVariation: 'showThree',
		allowExistingUsers: true
	},
	automatedTransfer3: {
		datestamp: '20170316',
		variations: {
			enabled: 50,
			disabled: 50,
		},
		defaultVariation: 'disabled',
		allowExistingUsers: false
	},
	domainSuggestionNudgeLabels: {
		datestamp: '20170327',
		variations: {
			original: 50,
			withLabels: 50
		},
		defaultVariation: 'original',
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
};
