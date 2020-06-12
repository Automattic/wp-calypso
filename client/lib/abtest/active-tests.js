/**
 * Note: this file is imported by `client` and `test/e2e` tests. `test/e2e` do not have the config
 * required to make aliased imports work (e.g. `import * from 'lib/'). As such, we must use relative
 * paths here (e.g. `import * from '../../lib/`)
 */

/**
 * Internal dependencies
 */
import * as RUM_DATA_COLLECTION from '../../lib/performance-tracking/const';

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
		datestamp: '20200611',
		variations: {
			composite: 100,
			regular: 0,
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
		datestamp: '20200421',
		variations: {
			offer: 50,
			noOffer: 50,
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
			variantShowUpdates: 100,
			control: 0,
		},
		defaultVariation: 'variantShowUpdates',
		allowExistingUsers: true,
	},
	domainStepPlanStepSwap: {
		datestamp: '20200513',
		variations: {
			variantShowSwapped: 0,
			control: 100,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	newSiteGutenbergOnboarding: {
		datestamp: '20200612',
		variations: {
			gutenberg: 10,
			control: 90,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
		localeTargets: [ 'en' ],
		countryCodeTargets: [ 'US', 'ID', 'NG', 'BD', 'NL', 'SE', 'SG', 'LK', 'NZ', 'IE', 'CA', 'AU' ],
	},
	domainShowJPResultsInJapan: {
		datestamp: '20200506',
		variations: {
			variantShowJPResults: 50,
			control: 50,
		},
		defaultVariation: 'control',
		localeTargets: 'any',
		countryCodeTargets: [ 'JP' ],
	},
	[ RUM_DATA_COLLECTION.AB_NAME ]: {
		datestamp: '20200602',
		variations: {
			[ RUM_DATA_COLLECTION.AB_VARIATION_ON ]: 50,
			[ RUM_DATA_COLLECTION.AB_VARIATION_OFF ]: 50,
		},
		defaultVariation: RUM_DATA_COLLECTION.AB_VARIATION_OFF,
		localeTargets: 'any',
		allowExistingUsers: true,
	},
	whiteGloveUpsell: {
		datestamp: '20200608',
		variations: {
			variantShowOffer: 10,
			control: 90,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
		countryCodeTargets: [ 'US' ],
	},
};
