/**
 * Internal dependencies
 */
import 'calypso/boot/polyfills';
import { bootApp } from 'calypso/boot/common';
import userFactory from 'calypso/lib/user';
import { siteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import { jetpackPricingContext } from 'calypso/jetpack-cloud/sections/pricing/controller';

/**
 * Style dependencies
 */
import 'calypso/assets/stylesheets/style.scss';
import 'calypso/assets/stylesheets/_calypso-color-scheme-jetpack-cloud.scss';
import 'calypso/jetpack-cloud/style.scss';
import 'calypso/jetpack-cloud/sections/pricing/style.scss';

const registerRoutes = () => {
	const user = userFactory();
	const isLoggedOut = ! user.get();

	jetpackPlans( `/:locale/pricing-new`, jetpackPricingContext );

	if ( isLoggedOut ) {
		jetpackPlans( `/pricing-new`, jetpackPricingContext );
	} else {
		jetpackPlans( `/pricing-new/:site?`, siteSelection, jetpackPricingContext );
	}
};

window.AppBoot = async () => {
	bootApp( 'Jetpack.com Pricing (New)', registerRoutes );
};
