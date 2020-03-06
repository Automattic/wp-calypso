/**
 * External dependencies
 */
import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { BackupProgress } from './types';
import { Button } from '@automattic/components';

interface Props {
	backupProgress: BackupProgress;
	siteId: number;
}

const BackupDownloadReady = ( { backupProgress: { backupPoint, url }, siteId }: Props ) => (
	<div>
		<h3>{ 'Your backup is now available for download.' }</h3>
		<p>
			{ `We successfully created a backup of your site ${ siteId } from ` }
			<strong>{ moment( backupPoint ).format( 'LLL' ) }</strong>
		</p>
		<Button href={ url } primary>
			{ 'Download file' }
		</Button>
	</div>
);

export default BackupDownloadReady;
