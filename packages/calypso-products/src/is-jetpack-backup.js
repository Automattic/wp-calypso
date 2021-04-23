/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isJetpackBackupSlug } from './is-jetpack-backup-slug';

export function isJetpackBackup( product ) {
	product = snakeCase( product );

	return isJetpackBackupSlug( product.product_slug );
}
