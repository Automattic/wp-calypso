/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { Button } from '@automattic/components';
import { Card } from '@automattic/components';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useTranslate } from 'i18n-calypso';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import JetpackLogo from 'calypso/components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';
import cloudErrorIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-error.svg';

/**
 * Type dependencies
 */
import type { Activity } from 'calypso/state/activity-log/types';

type Props = { backup: Activity; isFeatured: boolean };

const BackupFailed: FunctionComponent< Props > = ( { backup, isFeatured } ) => {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const backupDate = applySiteOffset( backup.activityTs, { timezone, gmtOffset } );

	const displayDate = backupDate.format( 'MMM Do' );
	const displayTime = backupDate.format( 'H:mma' );

	return (
		<Card
			className={ classNames( 'backup-card', {
				'is-featured': isFeatured,
			} ) }
		>
			<div className="backup-card__main">
				<div className="backup-card__header">
					<div className="backup-card__header-text">
						<h2 className="backup-card__date">{ translate( 'Backup failed' ) }</h2>
						<p className="backup-card__title backup-card__title--failed">
							<img className="backup-card__icon" src={ cloudErrorIcon } alt="" />
							{ translate( 'Backup attempted on %(displayDate)s, %(displayTime)s and failed', {
								args: { displayDate, displayTime },
							} ) }
						</p>
					</div>
				</div>
				<ul className="backup-card__actions">
					<li>
						<Button
							className="backup-card__support-button"
							href="https://jetpack.com/support/backup/"
							target="_blank"
							rel="noopener noreferrer"
							primary
						>
							{ translate( 'Read the support guide' ) }
						</Button>
					</li>
					<li>
						<Button
							className="backup-card__support-button"
							href={ contactSupportUrl( siteUrl ) }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ translate( 'Contact support' ) }
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
								<JetpackLogo className="backup-card__jetpack-logo-danger" size={ 32 } />
							</div>
							<div className="backup-card__about-body">
								{ translate(
									'Jetpack failed to complete the backup. Jetpack returned the following error:'
								) }
								<div>
									<ActivityDescription activity={ backup } />
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</Card>
	);
};

export default BackupFailed;
