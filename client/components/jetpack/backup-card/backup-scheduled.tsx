/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import JetpackLogo from 'calypso/components/jetpack-logo';
/**
 * Style dependencies
 */
import './style.scss';
import cloudScheduleIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-schedule.svg';

/**
 * Type dependencies
 */
import type { Moment } from 'moment';

type Props = { lastBackupDate: Moment; isFeatured: boolean };

const BackupScheduled: FunctionComponent< Props > = ( { lastBackupDate, isFeatured } ) => {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';

	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const moment = useLocalizedMoment();

	const today = applySiteOffset( moment(), {
		timezone: timezone,
		gmtOffset: gmtOffset,
	} );

	const yesterday = moment( today ).subtract( 1, 'days' );

	const lastBackupDay = lastBackupDate.isSame( yesterday, 'day' )
		? translate( 'Yesterday ' )
		: lastBackupDate.format( 'll' );

	const lastBackupTime = lastBackupDate.format( 'H:mma' );

	// Calculates the remaining hours for the next backup + 3 hours of safety margin
	const DAY_HOURS = 24;
	const hoursForNextBackup = DAY_HOURS - today.diff( lastBackupDate, 'hours' ) + 3;

	const nextBackupHoursText =
		hoursForNextBackup <= 1
			? translate( 'In the next hour' )
			: translate( 'In the next %d hour', 'In the next %d hours', {
					args: [ hoursForNextBackup ],
					count: hoursForNextBackup,
			  } );

	return (
		<Card
			className={ classNames( 'backup-card', {
				'is-featured': isFeatured,
			} ) }
		>
			<div className="backup-card__main">
				<div className="backup-card__header">
					<div className="backup-card__header-text">
						<h2 className="backup-card__date">{ nextBackupHoursText }</h2>
						<p className="backup-card__title backup-card__title--scheduled">
							<img className="backup-card__icon" src={ cloudScheduleIcon } alt="" />
							{ translate( 'Your next backup has been scheduled' ) }
						</p>
					</div>
				</div>
				<ul className="backup-card__actions">
					<li>
						<Button className="backup-card__restore-button" primary disabled>
							{ translate( 'Restore to this point' ) }
						</Button>
					</li>
					<li>
						<Button className="backup-card__download-button" disabled>
							{ translate( 'Download backup' ) }
						</Button>
					</li>
				</ul>
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
								{ translate(
									'Jetpack has scheduled your next backup. {{link}}Your last backup was %(lastBackupDay)s %(lastBackupTime)s{{/link}}',
									{
										args: { lastBackupDay, lastBackupTime },
										components: {
											link: (
												<a
													href={ backupMainPath( siteSlug, {
														date: lastBackupDate.format( INDEX_FORMAT ),
													} ) }
												/>
											),
										},
									}
								) }
							</div>
						</li>
					</ul>
				</div>
			</div>
		</Card>
	);
};

export default BackupScheduled;
