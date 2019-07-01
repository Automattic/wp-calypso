/** @format */
export default {
	improvedOnboarding: {
		datestamp: '20190314',
		variations: {
			main: 0,
			onboarding: 100,
		},
		defaultVariation: 'main',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
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
	builderReferralHelpPopover: {
		datestamp: '20190227',
		variations: {
			builderReferralLink: 10,
			original: 90,
		},
		defaultVariation: 'original',
	},
	gSuiteContinueButtonCopy: {
		datestamp: '20190307',
		variations: {
			purchase: 50,
			original: 50,
		},
		defaultVariation: 'original',
	},
	builderReferralHelpBanner: {
		datestamp: '20190304',
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
	hideDotBlogSubdomainsV2: {
		datestamp: '20190626',
		variations: {
			show: 50,
			hide: 50,
		},
		defaultVariation: 'show',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
	popularPlanBy: {
		datestamp: '20190529',
		variations: {
			siteType: 0,
			customerType: 100,
		},
		defaultVariation: 'siteType',
	},
	hideBloggerPlan2: {
		datestamp: '20190627',
		variations: {
			hide: 50,
			control: 50,
		},
		defaultVariation: 'control',
		localeTargets: 'any',
	},
	proratedCreditsBanner: {
		//this test is used to dial down the upsell offer
		datestamp: '20190626',
		variations: {
			control: 50,
			variant: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
};
