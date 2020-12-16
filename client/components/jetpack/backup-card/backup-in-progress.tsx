/**
 * External dependencies
 */
import { Card, ProgressBar } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { Interval, EVERY_SECOND } from 'calypso/lib/interval';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import JetpackLogo from 'calypso/components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';
import cloudScheduleIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-schedule.svg';

const LastBackupMessage: React.FC< LastBackupMessageProps > = ( { lastBackupDate } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const today = useDateWithOffset( moment() );
	const yesterday = moment( today ).subtract( 1, 'days' );

	// Will be undefined if lastBackupDate is null or undefined
	const siteLastBackupDate = useDateWithOffset( lastBackupDate, {
		shouldExecute: !! lastBackupDate,
	} );

	let lastBackupDisplayDate;
	if ( ! siteLastBackupDate ) {
		lastBackupDisplayDate = undefined;
	} else if ( siteLastBackupDate.isSame( today, 'day' ) ) {
		lastBackupDisplayDate = translate( 'Today %(time)s', {
			args: { time: siteLastBackupDate.format( 'LT' ) },
			comment: '%(time)s is a localized representation of the time of day',
		} );
	} else if ( siteLastBackupDate.isSame( yesterday, 'day' ) ) {
		lastBackupDisplayDate = translate( 'Yesterday %(time)s', {
			args: { time: siteLastBackupDate.format( 'LT' ) },
			comment: '%(time)s is a localized representation of the time of day',
		} );
	} else {
		lastBackupDisplayDate = siteLastBackupDate.format( 'lll' );
	}

	return (
		<>
			{ siteLastBackupDate
				? translate(
						'Jetpack is currently backing up your site. {{link}}Your last backup before today was %(lastBackupDisplayDate)s.{{/link}}',
						{
							args: { lastBackupDisplayDate },
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
				: translate( 'Jetpack is currently backing up your site for the first time.' ) }
		</>
	);
};

const BackupInProgress: React.FC< BackupInProgressProps > = ( { lastBackupDate, isFeatured } ) => {
	const translate = useTranslate();

	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const refreshBackupProgress = useCallback( () => dispatch( requestRewindBackups( siteId ) ), [
		dispatch,
		siteId,
	] );

	return (
		<>
			<Interval onTick={ refreshBackupProgress } period={ EVERY_SECOND } />
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

							<ProgressBar className="backup-card__progress" value={ 42 } total={ 100 } />
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
									<LastBackupMessage lastBackupDate={ lastBackupDate } />
								</div>
							</li>
						</ul>
					</div>
				</div>
			</Card>
		</>
	);
};

type BackupInProgressProps = {
	lastBackupDate?: Moment;
	isFeatured: boolean;
};

type LastBackupMessageProps = {
	lastBackupDate?: Moment;
};

export default BackupInProgress;
