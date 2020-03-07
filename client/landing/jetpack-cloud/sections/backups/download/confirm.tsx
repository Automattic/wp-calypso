/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	backupDateString: string;
	onConfirm: () => void;
	siteTitle: string | null;
}

const BackupDownloadConfirm = ( { backupDateString, onConfirm, siteTitle }: Props ) => (
	<div>
		<h3>{ 'Create downloadable backup' }</h3>
		<p>
			<strong>{ backupDateString }</strong>
			{ ` is the selected point to create a download backup of ${
				siteTitle ? siteTitle : 'your site'
			}.` }
		</p>
		<Button onClick={ onConfirm }>{ 'Create downloadable backup' }</Button>
	</div>
);

export default BackupDownloadConfirm;
