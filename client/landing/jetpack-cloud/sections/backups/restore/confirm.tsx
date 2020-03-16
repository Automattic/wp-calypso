/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	onConfirm: () => void;
	restoreId?: number | string;
	siteId: number | null;
}

const BackupRestoreConfirm = ( { restoreId, siteId, onConfirm }: Props ) => (
	<div>
		<p>
			You have chosen to restore site { siteId } to { restoreId }.
		</p>
		<Button primary onClick={ onConfirm }>
			{ 'Confirm Restore' }
		</Button>
	</div>
);

export default BackupRestoreConfirm;
