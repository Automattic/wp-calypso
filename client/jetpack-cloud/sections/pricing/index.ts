/**
 * Internal dependencies
 */
import plansV2 from 'calypso/my-sites/plans-v2';
import * as controller from './controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	plansV2( `/:locale/pricing`, controller.jetpackPricingContext );
	plansV2( `/pricing`, controller.jetpackPricingContext );
}
