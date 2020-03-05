/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	onConfirm: () => null;
	restoreId?: number | string;
	siteId: number | null;
}

const BackupRestoreConfirm = ( { restoreId, siteId, onConfirm }: Props ) => (
	<div>
		<p>
			You have chosen to restore site { siteId } to { restoreId }.
		</p>
		<Button onClick={ onConfirm }>{ 'Confirm Restore' }</Button>
	</div>
);

export default BackupRestoreConfirm;
