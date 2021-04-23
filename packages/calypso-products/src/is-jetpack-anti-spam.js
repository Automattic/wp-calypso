/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isJetpackAntiSpamSlug } from './is-jetpack-anti-spam-slug';

export function isJetpackAntiSpam( product ) {
	product = snakeCase( product );

	return isJetpackAntiSpamSlug( product.product_slug );
}
