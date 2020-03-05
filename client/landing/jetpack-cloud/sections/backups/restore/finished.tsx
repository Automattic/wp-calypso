/**
 * External dependencies
 */
import React from 'react';

interface Props {
	restoreId: string;
	siteId: number;
}

const BackupRestoreFinished = ( { restoreId, siteId }: Props ) => (
	<div>
		<p>
			Restore Finished for site { siteId } to { restoreId }
		</p>
	</div>
);

export default BackupRestoreFinished;
