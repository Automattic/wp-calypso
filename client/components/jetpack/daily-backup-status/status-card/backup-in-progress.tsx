/**
 * External dependencies
 */
import { ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import useGetDisplayDate from '../use-get-display-date';

/**
 * Style dependencies
 */
import './style.scss';
import cloudScheduleIcon from './icons/cloud-schedule.svg';

const BackupInProgress: React.FC< Props > = ( { percent, inProgressDate, lastBackupDate } ) => {
	const translate = useTranslate();
	const getDisplayDate = useGetDisplayDate();

	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteLastBackupDate = useDateWithOffset( lastBackupDate, {
		shouldExecute: !! lastBackupDate,
	} );
	const inProgressDisplayDate = getDisplayDate( inProgressDate, false );
	const lastBackupDisplayDate = lastBackupDate
		? getDisplayDate( lastBackupDate, false )
		: undefined;

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudScheduleIcon } alt="" role="presentation" />
				<div className="status-card__hide-mobile">{ translate( 'Backup In Progress' ) }</div>
			</div>
			<div className="status-card__title">
				<div className="status-card__hide-desktop">{ translate( 'Backup In Progress' ) }:</div>
			</div>

			<p className="status-card__label">
				{ translate(
					"We're making a backup of your site from {{strong}}%(inProgressDisplayDate)s{{/strong}}.",
					{
						args: {
							inProgressDisplayDate: preventWidows( inProgressDisplayDate ),
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>

			<ProgressBar value={ percent } total={ 100 } />

			{ siteLastBackupDate && (
				<div className="status-card__no-backup-last-backup">
					{ translate( 'Last backup before today: {{link}}%(lastBackupDisplayDate)s{{/link}}', {
						args: { lastBackupDisplayDate: preventWidows( lastBackupDisplayDate ) },
						components: {
							link: (
								<a
									href={ backupMainPath( siteSlug, {
										date: siteLastBackupDate.format( INDEX_FORMAT ),
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
	percent: number;
	inProgressDate: Moment;
	lastBackupDate?: Moment;
};

export default BackupInProgress;
