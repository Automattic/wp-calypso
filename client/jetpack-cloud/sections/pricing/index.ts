/**
 * Internal dependencies
 */
import { jetpackPricingContext } from './controller';
import config from '@automattic/calypso-config';
import { loggedInSiteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';

/**
 * Style dependencies
 */
import './style.scss';

export default function (): void {
	jetpackPlans( `/:locale/pricing`, jetpackPricingContext );

	jetpackPlans( `/pricing`, loggedInSiteSelection, jetpackPricingContext );

	if ( config.isEnabled( 'jetpack-cloud/connect' ) ) {
		jetpackPlans( `/plans/:site?`, loggedInSiteSelection, jetpackPricingContext );
	}
}
