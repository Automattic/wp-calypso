import { formatProduct } from './format-product';
import { isBusiness } from './is-business';
import { isJetpackPlan } from './is-jetpack-plan';

export function isJetpackBusiness( product ) {
	product = formatProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}
