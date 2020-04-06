/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import BackupActivityLog from 'landing/jetpack-cloud/components/backup-activity-log';

const BackupActivityLogPage: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<div>
			<h3>{ translate( 'Find a backup or restore point' ) }</h3>
			<p>
				{ translate(
					'This is the complete event history for your site. Filter by date range and/or activity type.'
				) }
			</p>
			<BackupActivityLog />
		</div>
	);
};

export default BackupActivityLogPage;
