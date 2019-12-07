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
	gSuiteContinueButtonCopy: {
		datestamp: '20190307',
		variations: {
			purchase: 50,
			original: 50,
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
	showPlanUpsellGSuite: {
		datestamp: '20190805',
		variations: {
			variantShowPlanBump: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	showPlanUpsellConcierge: {
		datestamp: '20190805',
		variations: {
			variantShowPlanBump: 100,
			control: 0,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	removeBlogFlow: {
		datestamp: '20190813',
		variations: {
			remove: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	customerHomePage: {
		datestamp: '20190903',
		variations: {
			show: 50,
			hide: 50,
		},
		defaultVariation: 'hide',
		assignmentMethod: 'userId',
	},
	signupEscapeHatch: {
		datestamp: '20190826',
		variations: {
			variant: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	placesApiInCheckout: {
		datestamp: '20190923',
		variations: {
			original: 50,
			placesApi: 50,
		},
		defaultVariation: 'original',
	},
};
