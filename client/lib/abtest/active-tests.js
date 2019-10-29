/** @format */
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
	popularPlanBy: {
		datestamp: '20190529',
		variations: {
			siteType: 0,
			customerType: 100,
		},
		defaultVariation: 'siteType',
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
	signupWithBasicSite: {
		datestamp: '20190930',
		variations: {
			variant: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	verticalSuggestedThemes: {
		datestamp: '20191029',
		variations: {
			control: 90,
			test: 10,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	passwordlessSignup: {
		datestamp: '20191013',
		variations: {
			passwordless: 10,
			default: 90,
		},
		defaultVariation: 'default',
	},
	checkoutPaymentTypes: {
		datestamp: '20191028',
		variations: {
			tabs: 50,
			radios: 50,
		},
		defaultVariation: 'tabs',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	designFirstSignup: {
		datestamp: '20201029',
		variations: {
			defaultFirst: 0,
			default: 100,
		},
		defaultVariation: 'default',
		allowExistingUsers: true,
	},
};
