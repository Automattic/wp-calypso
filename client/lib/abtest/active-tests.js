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
	// ⚠️ The ExPlat team is monitoring additions to this object 😈
	// Let us know if there is a use-case we have missed adding in ExPlat.
	// If you are looking for the conciergeUpsellDial experiment it has been replaced with
	// a naiveClientSideRollout in `client/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url.ts`
};
