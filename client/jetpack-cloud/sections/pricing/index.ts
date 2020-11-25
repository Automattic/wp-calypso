/**
 * Internal dependencies
 */
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import * as controller from './controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function (): void {
	jetpackPlans( `/:locale/pricing`, controller.jetpackPricingContext );
	jetpackPlans( `/pricing`, controller.jetpackPricingContext );
	jetpackPlans( `/plans`, controller.jetpackPricingContext );
}
