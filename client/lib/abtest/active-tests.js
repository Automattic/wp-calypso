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
	signupStore: {
		datestamp: '20160927',
		variations: {
			designTypeWithoutStore: 0,
			designTypeWithStore: 100,
		},
		defaultVariation: 'designTypeWithStore',
		allowExistingUsers: false,
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
	premiumSquaredPlansWording: {
		datestamp: '20170111',
		variations: {
			withoutMarketingCopy: 50,
			withMarketingCopy: 50
		},
		defaultVariation: 'withoutMarketingCopy',
		allowExistingUsers: true
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
	automatedTransfer2: {
		datestamp: '20170316',
		variations: {
			enabled: 100,
			disabled: 0
		},
		defaultVariation: 'disabled',
		allowExistingUsers: false
	},
};
