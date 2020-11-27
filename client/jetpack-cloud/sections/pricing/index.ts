/**
 * Internal dependencies
 */
import config from 'calypso/config';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import * as controller from './controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function (): void {
	jetpackPlans( `/:locale/pricing`, controller.jetpackPricingContext );
	jetpackPlans( `/pricing`, controller.jetpackPricingContext );

	if ( config.isEnabled( 'jetpack-cloud/connect' ) ) {
		jetpackPlans( `/plans`, controller.jetpackPricingContext );
	}
}
