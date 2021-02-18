/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isBlogger } from 'calypso/lib/products-values/is-blogger';
import { isBusiness } from 'calypso/lib/products-values/is-business';
import { isEcommerce } from 'calypso/lib/products-values/is-ecommerce';
import { isEnterprise } from 'calypso/lib/products-values/is-enterprise';
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import { isJpphpBundle } from 'calypso/lib/products-values/is-jpphp-bundle';
import { isPersonal } from 'calypso/lib/products-values/is-personal';
import { isPremium } from 'calypso/lib/products-values/is-premium';
import { isP2Plus } from 'calypso/lib/products-values/is-p2-plus';

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
