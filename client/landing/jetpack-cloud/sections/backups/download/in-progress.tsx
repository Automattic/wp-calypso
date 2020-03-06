/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';

interface Props {
	percent: number;
	siteId: number;
}

const BackupDownloadInProgress = ( { percent, siteId }: Props ) => (
	<div>
		<p>BackupDownloadInProgress for { siteId }</p>
		<ProgressBar value={ percent } total={ 100 } />
	</div>
);

export default BackupDownloadInProgress;
