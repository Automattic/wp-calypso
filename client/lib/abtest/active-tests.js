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
	reduceThemesInSignupTest: {
		datestamp: '20170518',
		variations: {
			original: 0,
			modified: 100,
		},
		defaultVariation: 'original',
	},
	savingsInCheckoutSummary: {
		datestamp: '20170516',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'show',
	},
	siteCreationStepOne: {
		datestamp: '20170524',
		variations: {
			original: 50,
			modified: 50,
		},
		defaultVariation: 'original',
	},
	selectCtaInDomainsSignup: {
		datestamp: '20170529',
		variations: {
			original: 50,
			select: 50,
		},
		defaultVariation: 'original',
	},
};
