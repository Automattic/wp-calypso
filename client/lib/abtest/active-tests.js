/**
 * Note: this file is imported by `client` and `test/e2e` tests. `test/e2e` do not have the config
 * required to make aliased imports work (e.g. `import * from 'lib/'). As such, we must use relative
 * paths here (e.g. `import * from '../../lib/`)
 */

/**************************************************************************************************/
/* This library is deprecated! Please consider ExPlat for your next A/B experiment.               */
/* See /client/components/experiment/readme.md for more info!
/**************************************************************************************************/

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
		datestamp: '20200910',
		variations: {
			offer: 75,
			noOffer: 25,
		},
		defaultVariation: 'noOffer',
		allowExistingUsers: true,
	},
	userlessCheckout: {
		datestamp: '20210806',
		variations: {
			variantUserless: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
		countryCodeTargets: [ 'US', 'CA' ],
	},
	reskinSignupFlow: {
		datestamp: '20300928',
		variations: {
			reskinned: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: false,
	},
	freePlansDomainUpsell: {
		datestamp: '20201210',
		variations: {
			test: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	popularProductsOffering: {
		datestamp: '20201217',
		variations: {
			dailyProducts: 50,
			control: 50,
		},
		defaultVariation: 'control',
		allowExistingUsers: true,
	},
	gutenbergInCalypso: {
		datestamp: '20200903',
		variations: {
			on: 0,
			off: 100,
		},
		defaultVariation: 'off',
		allowExistingUsers: true,
		localeTargets: 'any',
	},
};
