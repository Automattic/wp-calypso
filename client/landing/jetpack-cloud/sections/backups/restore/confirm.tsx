/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	restoreId: number | string;
	selectedSiteId: number;
	onConfirm: () => null;
}

const BackupRestoreConfirm = ( { restoreId, selectedSiteId, onConfirm }: Props ) => (
	<div className="backup-restore-page">
		<p>
			You have chosen to restore site { selectedSiteId } to { restoreId }.
		</p>
		<Button onClick={ onConfirm }>{ 'Confirm Restore' }</Button>
	</div>
);

export default BackupRestoreConfirm;
