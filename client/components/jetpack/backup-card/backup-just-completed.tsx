/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import classNames from 'classnames';
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
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { useGetDisplayDate } from './hooks';

/**
 * Style dependencies
 */
import './style.scss';
import cloudScheduleIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-schedule.svg';

const BackupJustCompleted: React.FC< Props > = ( { lastBackupDate, isFeatured } ) => {
	const translate = useTranslate();
	const getDisplayDate = useGetDisplayDate();

	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteLastBackupDate = useDateWithOffset( lastBackupDate );

	const lastBackupDisplayDate = siteLastBackupDate && getDisplayDate( siteLastBackupDate );

	return (
		<Card
			className={ classNames( 'backup-card', {
				'is-featured': isFeatured,
			} ) }
		>
			<div className="backup-card__main">
				<div className="backup-card__header">
					<div className="backup-card__header-text">
						<h2 className="backup-card__date">{ translate( 'Backup just completed' ) }</h2>
						<p className="backup-card__title backup-card__title--in-progress">
							<img className="backup-card__icon" src={ cloudScheduleIcon } alt="" />
							{ translate( "We're almost done making a backup of your site" ) }
						</p>
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
											"You'll be able to access your new backup in just a few minutes. {{link}}Your last backup before today was %(lastBackupDisplayDate)s.{{/link}}",
											{
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
											}
									  )
									: translate( "You'll be able to access your new backup in just a few minutes." ) }
							</div>
						</li>
					</ul>
				</div>
			</div>
		</Card>
	);
};

type Props = {
	lastBackupDate?: Moment;
	isFeatured: boolean;
};

export default BackupJustCompleted;
