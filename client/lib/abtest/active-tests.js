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
	removeDomainsStepFromOnboarding: {
		datestamp: '20190412',
		variations: {
			keep: 100,
			remove: 0,
		},
		defaultVariation: 'keep',
	},
	twoYearPlanByDefault: {
		datestamp: '20190207',
		variations: {
			originalFlavor: 100,
			twoYearFlavor: 0,
		},
		defaultVariation: 'originalFlavor',
	},
	gSuitePostCheckoutNotice: {
		datestamp: '20190211',
		variations: {
			original: 50,
			enhanced: 50,
		},
		defaultVariation: 'original',
	},
	pluginFeaturedTitle: {
		datestamp: '20190220',
		variations: {
			featured: 50,
			recommended: 50,
		},
		defaultVariation: 'featured',
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
	checklistSiteLogo: {
		datestamp: '20190305',
		variations: {
			icon: 50,
			logo: 50,
		},
		defaultVariation: 'icon',
		allowExistingUsers: true,
		localeTargets: 'any',
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
	showCheckoutCartRight: {
		datestamp: '20190502',
		variations: {
			variantRightColumn: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	hideBloggerPlan: {
		datestamp: '20190521',
		variations: {
			hide: 50,
			control: 50,
		},
		defaultVariation: 'control',
	},
};
