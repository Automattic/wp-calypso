/**
 * External dependencies
 */
import React from 'react';

interface Props {
	percent?: number;
}

const BackupRestoreInProgress = ( { percent }: Props ) => (
	<div>
		<p>BackupRestoreInProgress: { percent ? percent : 0 }% done...</p>
	</div>
);

export default BackupRestoreInProgress;
