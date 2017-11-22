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
	signupAtomicStoreVsPressable: {
		datestamp: '20171101',
		variations: {
			atomic: 99,
			pressable: 1,
		},
		defaultVariation: 'atomic',
		allowExistingUsers: true,
		localeTargets: 'any',
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
	unlimitedThemeNudge: {
		datestamp: '20171016',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	gsuiteUpsell: {
		datestamp: '20171025',
		variations: {
			show: 50,
			hide: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
	domainsCheckoutLocalizedAddresses: {
		datestamp: '20171025',
		variations: {
			showLocalizedAddressFormats: 50,
			showDefaultAddressFormat: 50,
		},
		defaultVariation: 'showDefaultAddressFormat',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	buttonsColorOnPostSignup: {
		datestamp: '20171108',
		variations: {
			keep: 50,
			change: 50,
		},
		defaultVariation: 'keep',
		allowExistingUsers: true,
	},
	condensedPostList: {
		datestamp: '20171113',
		variations: {
			condensedPosts: 5,
			largePosts: 95,
		},
		defaultVariation: 'largePosts',
	},
	showNewPaymentMethods: {
		datestamp: '20171115',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
};
