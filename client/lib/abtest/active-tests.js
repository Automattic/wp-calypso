module.exports = {
	multiDomainRegistrationV1: {
		datestamp: '20200721',
		variations: {
			singlePurchaseFlow: 10,
			popupCart: 45,
			keepSearchingInGapps: 45,
		},
		defaultVariation: 'singlePurchaseFlow',
	},
	signupSurveyStep: {
		datestamp: '20170329',
		variations: {
			showSurveyStep: 20,
			hideSurveyStep: 80,
		},
		defaultVariation: 'hideSurveyStep',
	},
	businessPlanDescriptionAT: {
		datestamp: '20170605',
		variations: {
			original: 50,
			pluginsAndThemes: 50,
		},
		defaultVariation: 'original',
	},
	presaleChatButton: {
		datestamp: '20170328',
		variations: {
			showChatButton: 20,
			original: 80,
		},
		defaultVariation: 'original',
		localeTargets: 'any',
	},
	newSiteWithJetpack: {
		datestamp: '20170419',
		variations: {
			showNewJetpackSite: 50,
			onlyDotComSites: 50,
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
	ATPromptOnCancel: {
		datestamp: '20170515',
		variations: {
			hide: 20,
			show: 80,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	ATUpgradeOnCancel: {
		datestamp: '20170515',
		variations: {
			hide: 20,
			show: 80,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	signupPlansCopyChanges: {
		datestamp: '20170623',
		variations: {
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
	},
	showCartAbandonmentNotice: {
		datestamp: '20170630',
		variations: {
			doNotShowNotice: 50,
			showNotice: 50,
		},
		defaultVariation: 'doNotShowNotice',
		allowExistingUsers: true,
	},
	postPublishConfirmation: {
		datestamp: '20170713',
		allowExistingUsers: true,
		variations: {
			showPublishConfirmation: 30,
			noPublishConfirmation: 70,
		},
		defaultVariation: 'noPublishConfirmation',
	},
	readerIntroIllustration: {
		datestamp: '20170718',
		variations: {
			blue: 33,
			lightBlue: 33,
			white: 34,
		},
		defaultVariation: 'white',
		assignmentMethod: 'userId',
	},
	paymentShowPaypalLogo: {
		datestamp: '20170719',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
};
