import { loggedInSiteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import { jetpackPricingContext } from './controller';
import './style.scss';

export default function (): void {
	jetpackPlans( `/:locale/pricing`, jetpackPricingContext );
	jetpackPlans( `/pricing`, loggedInSiteSelection, jetpackPricingContext );
}
