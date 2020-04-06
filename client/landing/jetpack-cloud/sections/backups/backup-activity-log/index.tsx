/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import BackupActivityLog from 'landing/jetpack-cloud/components/backup-activity-log';

const BackupActivityLogPage: FunctionComponent = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	return (
		<div>
			<h3>{ translate( 'Find a backup or restore point' ) }</h3>
			<p>
				{ translate(
					'This is the complete event history for your site. Filter by date range and/or activity type.'
				) }
			</p>
			{ siteId && <BackupActivityLog siteId={ siteId } /> }
		</div>
	);
};

export default BackupActivityLogPage;
