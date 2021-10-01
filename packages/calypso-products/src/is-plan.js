import { formatProduct } from './format-product';
import { isBlogger } from './is-blogger';
import { isBusiness } from './is-business';
import { isEcommerce } from './is-ecommerce';
import { isEnterprise } from './is-enterprise';
import { isJetpackPlan } from './is-jetpack-plan';
import { isJpphpBundle } from './is-jpphp-bundle';
import { isP2Plus } from './is-p2-plus';
import { isPersonal } from './is-personal';
import { isPremium } from './is-premium';

export function isPlan( product ) {
	product = formatProduct( product );

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
