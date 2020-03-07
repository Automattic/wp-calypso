/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';

interface Props {
	backupDateString: string;
	percent?: number;
	siteTitle: string | null;
}

const BackupDownloadInProgress = ( { backupDateString, percent, siteTitle }: Props ) => (
	<div>
		<h3>{ `Currently creating a downloadable backup of ${ siteTitle }` }</h3>
		<ProgressBar value={ percent ? percent : 0 } total={ 100 } />
		<p>{ `We're creating a downloadable backup of your site from ${ backupDateString } ` }</p>
		<h4>{ 'Check your email' }</h4>
		<p>{ 'For your convenience, we’ll email you when your file is ready.' }</p>
	</div>
);

export default BackupDownloadInProgress;
