/**
 * Internal dependencies
 */
import plansV2 from 'my-sites/plans-v2';
import * as controller from './controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	plansV2( `/pricing`, controller.jetpackPricingContext );
}
