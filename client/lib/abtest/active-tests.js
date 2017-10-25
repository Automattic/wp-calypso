/** @format */
export default {
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
	signupPressableStoreFlow: {
		datestamp: '20171018',
		variations: {
			atomic: 99,
			pressable: 1,
		},
		defaultVariation: 'atomic',
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
	skipThemesSelectionModal: {
		datestamp: '20170904',
		variations: {
			skip: 50,
			show: 50,
		},
		defaultVariation: 'show',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	recommendShortestDomain: {
		datestamp: '20171010',
		variations: {
			shortest: 50,
			original: 50,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	checkoutPaymentMethodTabs: {
		datestamp: '20171019',
		variations: {
			tabs: 50,
			original: 50,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
};
