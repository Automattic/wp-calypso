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
	showPlanUpsellConcierge: {
		datestamp: '20191106',
		variations: {
			variantShowPlanBump: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	domainStepCopyUpdates: {
		datestamp: '20191121',
		variations: {
			variantShowUpdates: 90,
			control: 10,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	domainStepMoveParagraph: {
		datestamp: '20191216',
		variations: {
			variantMoveParagraph: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	nonEnglishDomainStepCopyUpdates: {
		datestamp: '20191219',
		variations: {
			variantShowUpdates: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
		localeTargets: 'any',
		localeExceptions: [ 'en' ],
	},
	domainSuggestionsWithHints: {
		datestamp: '20191220',
		variations: {
			variation2_front: 0,
			variation3_front: 50,
			variation4_front: 25,
			variation5_front: 25,
		},
		defaultVariation: 'variation2_front',
	},
	showBusinessPlanPopular: {
		datestamp: '20191220',
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
};
