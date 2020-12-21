/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import useGetDisplayDate from '../use-get-display-date';

/**
 * Style dependencies
 */
import './style.scss';
import cloudScheduleIcon from './icons/cloud-schedule.svg';

const BackupJustCompleted: React.FC< Props > = ( { justCompletedBackupDate, lastBackupDate } ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const getDisplayDate = useGetDisplayDate();

	const justCompletedDisplayDate = getDisplayDate( justCompletedBackupDate, false );
	const lastBackupDisplayDate = getDisplayDate( lastBackupDate, false );

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudScheduleIcon } alt="" role="presentation" />
				<div className="status-card__hide-mobile">{ translate( 'Backup just completed' ) }</div>
			</div>
			<div className="status-card__title">{ justCompletedDisplayDate }</div>

			<p className="status-card__label">
				{ translate( "You'll be able to access your new backup in just a few minutes." ) }
			</p>

			{ lastBackupDate && (
				<div className="status-card__no-backup-last-backup">
					{ translate( 'Last backup before today: {{link}}%(lastBackupDisplayDate)s{{/link}}', {
						args: { lastBackupDisplayDate: preventWidows( lastBackupDisplayDate ) },
						components: {
							link: (
								<a
									href={ backupMainPath( siteSlug, {
										date: lastBackupDate.format( INDEX_FORMAT ),
									} ) }
								/>
							),
						},
					} ) }
				</div>
			) }
		</>
	);
};

type Props = {
	justCompletedBackupDate: Moment;
	lastBackupDate?: Moment;
};

export default BackupJustCompleted;
