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
	signupDomainsHeadline: {
		datestamp: '20170313',
		variations: {
			original: 50,
			updated: 50
		},
		defaultVariation: 'original'
	},
	signupStepOneCopyChanges: {
		datestamp: '20170307',
		variations: {
			original: 0,
			modified: 100, //Test completed. Sending copy for translation.
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
	automatedTransfer2: {
		datestamp: '20170316',
		variations: {
			enabled: 100,
			disabled: 0
		},
		defaultVariation: 'disabled',
		allowExistingUsers: false
	},
	domainSuggestionNudgeLabels: {
		datestamp: '20170327',
		variations: {
			original: 50,
			updated: 50
		},
		defaultVariation: 'original',
		allowExistingUsers: true
	},
};
