/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isBlogger } from './is-blogger';
import { isBusiness } from './is-business';
import { isEcommerce } from './is-ecommerce';
import { isEnterprise } from './is-enterprise';
import { isJetpackPlan } from './is-jetpack-plan';
import { isJpphpBundle } from './is-jpphp-bundle';
import { isPersonal } from './is-personal';
import { isPremium } from './is-premium';
import { isP2Plus } from './is-p2-plus';

export function isPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return (
		isBlogger( product ) ||
		isPersonal( product ) ||
		isPremium( product ) ||
		isBusiness( product ) ||
		isEcommerce( product ) ||
		isEnterprise( product ) ||
		isJetpackPlan( product ) ||
		isJpphpBundle( product ) ||
		isP2Plus( product )
	);
}
