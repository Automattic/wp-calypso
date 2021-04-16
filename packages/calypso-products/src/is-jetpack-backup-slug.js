/**
 * External dependencies
 */
import { includes } from 'lodash';
import { JETPACK_BACKUP_PRODUCTS } from '@automattic/calypso-products';

export function isJetpackBackupSlug( productSlug ) {
	return includes( JETPACK_BACKUP_PRODUCTS, productSlug );
}
