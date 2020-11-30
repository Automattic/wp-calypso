/**
 * Internal dependencies
 */
import * as controller from './controller';
import config from 'calypso/config';
import { siteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';

/**
 * Style dependencies
 */
import './style.scss';

export default function (): void {
	jetpackPlans( `/:locale/pricing/:site?`, siteSelection, controller.jetpackPricingContext );
	jetpackPlans( `/pricing/:site?`, siteSelection, controller.jetpackPricingContext );

	if ( config.isEnabled( 'jetpack-cloud/connect' ) ) {
		jetpackPlans( `/plans/:site?`, siteSelection, controller.jetpackPricingContext );
	}
}
