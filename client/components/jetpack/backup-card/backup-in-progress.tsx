import { Card, ProgressBar } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import cloudScheduleIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-schedule.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useGetDisplayDate } from './hooks';

import './style.scss';

const BackupInProgress: React.FC< Props > = ( { percent, lastBackupDate, isFeatured } ) => {
	const translate = useTranslate();
	const getDisplayDate = useGetDisplayDate();

	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteLastBackupDate = useDateWithOffset( lastBackupDate, {
		shouldExecute: !! lastBackupDate,
	} );
	const lastBackupDisplayDate = lastBackupDate ? getDisplayDate( lastBackupDate ) : undefined;

	return (
		<Card
			className={ classNames( 'backup-card', {
				'is-featured': isFeatured,
			} ) }
		>
			<div className="backup-card__main">
				<div className="backup-card__header">
					<div className="backup-card__header-text">
						<h2 className="backup-card__date">{ translate( 'Backup in progress' ) }</h2>
						<p className="backup-card__title backup-card__title--in-progress">
							<img className="backup-card__icon" src={ cloudScheduleIcon } alt="" />
							{ translate( "We're making a backup of your site now" ) }
						</p>

						<ProgressBar className="backup-card__progress" value={ percent } total={ 100 } />
					</div>
				</div>
			</div>
			<div className="backup-card__about">
				<h3 className="backup-card__about-heading">{ translate( 'About this backup' ) }</h3>
				<div className="backup-card__about-content">
					<ul className="backup-card__about-list">
						<li>
							<div className="backup-card__about-media backup-card__about-media--notice">
								<JetpackLogo className="backup-card__jetpack-logo-muted" size={ 32 } />
							</div>
							<div className="backup-card__about-body">
								{ siteLastBackupDate
									? translate(
											'Jetpack is currently backing up your site. {{link}}Your last backup before today was %(lastBackupDisplayDate)s.{{/link}}',
											{
												args: {
													lastBackupDisplayDate: preventWidows( lastBackupDisplayDate ),
												},
												components: {
													link: (
														<a
															href={ backupMainPath( siteSlug, {
																date: siteLastBackupDate.format( INDEX_FORMAT ),
															} ) }
														/>
													),
												},
											}
									  )
									: translate( 'Jetpack is currently backing up your site.' ) }
							</div>
						</li>
					</ul>
				</div>
			</div>
		</Card>
	);
};

type Props = {
	percent: number;
	lastBackupDate?: Moment;
	isFeatured: boolean;
};

export default BackupInProgress;
