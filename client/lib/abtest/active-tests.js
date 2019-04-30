/** @format */
export default {
	improvedOnboarding: {
		datestamp: '20190314',
		variations: {
			main: 0,
			onboarding: 100,
		},
		defaultVariation: 'main',
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
	businessPlanDescriptionAT: {
		datestamp: '20170605',
		variations: {
			original: 50,
			pluginsAndThemes: 50,
		},
		defaultVariation: 'original',
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
	showConciergeSessionUpsell: {
		datestamp: '20181214',
		variations: {
			skip: 100,
			show: 0,
		},
		defaultVariation: 'skip',
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
	jetpackMonthlyPlansOnly: {
		datestamp: '20190312',
		variations: {
			original: 50,
			monthlyOnly: 50,
		},
		defaultVariation: 'original',
		allowExistingUsers: true,
		localeTargets: 'any',
		countryCodeTargets: [ 'ES', 'IT', 'PT', 'FR', 'NL', 'DE', 'BE', 'PL', 'SE' ],
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
	domainSuggestionsEnCheck: {
		datestamp: '20190415',
		variations: {
			control: 50,
			test: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	conciergeUpsellDial: {
		//this test is used to dial down
		datestamp: '20190429',
		variations: {
			offer: 50,
			noOffer: 50,
		},
		defaultVariation: 'noOffer',
		allowExistingUsers: true,
	},
};
