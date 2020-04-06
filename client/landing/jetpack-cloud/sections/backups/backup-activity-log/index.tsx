/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import BackupsActivityLog from 'landing/jetpack-cloud/components/backups-activity-log';

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
			<BackupsActivityLog />
		</div>
	);
};

export default BackupActivityLogPage;
