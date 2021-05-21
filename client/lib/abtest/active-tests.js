/**
 * Note: this file is imported by `client` and `test/e2e` tests. `test/e2e` do not have the config
 * required to make aliased imports work (e.g. `import * from 'lib/'). As such, we must use relative
 * paths here (e.g. `import * from '../../lib/`)
 */

/**************************************************************************************************/
/* This library is deprecated! Please consider ExPlat for your next A/B experiment.               */
/* See /client/lib/explat/readme.md for more info!
/**************************************************************************************************/

export default {
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
	newUsersWithFreePlan: {
		datestamp: '20210107',
		variations: {
			newOnboarding: 0,
			control: 100,
		},
		localeTargets: 'any',
		localeExceptions: [ 'en', 'es' ],
		defaultVariation: 'control',
		allowExistingUsers: false,
	},
};
