/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { isBlogger } from 'lib/products-values/is-blogger';
import { isBusiness } from 'lib/products-values/is-business';
import { isEcommerce } from 'lib/products-values/is-ecommerce';
import { isEnterprise } from 'lib/products-values/is-enterprise';
import { isJetpackPlan } from 'lib/products-values/is-jetpack-plan';
import { isJpphpBundle } from 'lib/products-values/is-jpphp-bundle';
import { isPersonal } from 'lib/products-values/is-personal';
import { isPremium } from 'lib/products-values/is-premium';

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
		isJpphpBundle( product )
	);
}
