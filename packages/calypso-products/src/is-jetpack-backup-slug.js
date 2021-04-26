/**
 * External dependencies
 */
import { includes } from 'lodash';
import { JETPACK_BACKUP_PRODUCTS } from './index';

export function isJetpackBackupSlug( productSlug ) {
	return includes( JETPACK_BACKUP_PRODUCTS, productSlug );
}
