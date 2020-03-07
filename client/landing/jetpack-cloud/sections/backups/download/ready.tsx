/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	downloadUrl?: string;
	longBackupDateString: string;
	siteTitle: string | null;
}

const BackupDownloadReady = ( { downloadUrl, longBackupDateString, siteTitle }: Props ) => (
	<div>
		<h3>{ 'Your backup is now available for download.' }</h3>
		<p>
			{ `We successfully created a backup of your site ${
				siteTitle ? siteTitle : 'your site'
			} from ` }
			<strong>{ longBackupDateString }</strong>
		</p>
		<Button href={ downloadUrl } primary>
			{ 'Download file' }
		</Button>
	</div>
);

export default BackupDownloadReady;
