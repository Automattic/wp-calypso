/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { addItem, addItems } from 'lib/cart/actions';
import { jetpackProductItem } from 'lib/cart-values/cart-items';
import { PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_SCAN } from 'lib/products-values/constants';

export const MultiCartPrototype: React.FunctionComponent = () => {
	const addBackupDaily = () => {
		addItem( jetpackProductItem( PRODUCT_JETPACK_BACKUP_DAILY ) );
	};

	const addScanDaily = () => {
		addItem( jetpackProductItem( PRODUCT_JETPACK_SCAN ) );
	};

	const addBackupAndScanDaily = () => {
		addItems( [
			jetpackProductItem( PRODUCT_JETPACK_BACKUP_DAILY ),
			jetpackProductItem( PRODUCT_JETPACK_SCAN ),
		] );
	};

	return (
		<>
			<Button onClick={ addBackupDaily }>Add Backup Daily</Button>
			<Button onClick={ addScanDaily }>Add Scan Daily</Button>
			<Button onClick={ addBackupAndScanDaily }>Add Backup and Scan Daily</Button>
		</>
	);
};
