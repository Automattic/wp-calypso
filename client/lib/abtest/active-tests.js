export default {
	cartNudgeUpdateToPremium: {
		datestamp: '20180917',
		variations: {
			test: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	springSale30PercentOff: {
		datestamp: '20180413',
		variations: {
			upsell: 50,
			control: 50,
		},
		defaultVariation: 'control',
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
	showCompositeCheckout: {
		datestamp: '20200214',
		variations: {
			composite: 10,
			regular: 90,
		},
		defaultVariation: 'regular',
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
	builderReferralStatsNudge: {
		datestamp: '20181218',
		variations: {
			builderReferralBanner: 25,
			googleMyBusinessBanner: 75,
		},
		defaultVariation: 'googleMyBusinessBanner',
	},
	builderReferralThemesBanner: {
		datestamp: '20181218',
		variations: {
			builderReferralBanner: 25,
			original: 75,
		},
		defaultVariation: 'original',
	},
	pageBuilderMVP: {
		datestamp: '20190419',
		variations: {
			control: 100,
			test: 0,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	conciergeUpsellDial: {
		//this test is used to dial down the upsell offer
		datestamp: '20190429',
		variations: {
			offer: 100,
			noOffer: 0,
		},
		defaultVariation: 'noOffer',
		allowExistingUsers: true,
	},
	skippableDomainStep: {
		datestamp: '20290717',
		variations: {
			skippable: 0,
			notSkippable: 100,
		},
		defaultVariation: 'notSkippable',
		allowExistingUsers: true,
	},
	passwordlessSignup: {
		datestamp: '20291029',
		variations: {
			passwordless: 0,
			default: 100,
		},
		defaultVariation: 'default',
	},
	domainStepCopyUpdates: {
		datestamp: '20191121',
		variations: {
			variantShowUpdates: 90,
			control: 10,
		},
		defaultVariation: 'variantShowUpdates',
		allowExistingUsers: true,
	},
	showBusinessPlanPopular: {
		datestamp: '20200109',
		variations: {
			variantShowBizPopular: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
		localeTargets: 'any',
		localeExceptions: [ 'en' ],
	},
	readerFreeToPaidPlanNudge: {
		datestamp: '20200102',
		variations: {
			display: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
		localeTargets: 'any',
	},
	redirectToCustomerHome: {
		datestamp: '20200117',
		variations: {
			variant: 10,
			control: 90,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
	},
	sidebarUpsellNudgeUnification: {
		datestamp: '20200127',
		variations: {
			variantShowUnifiedUpsells: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	domainStepDesignUpdates: {
		datestamp: '20200205',
		variations: {
			variantDesignUpdates: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
};
