/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import Button from 'calypso/components/forms/form-button';
import useGetDisplayDate from '../use-get-display-date';

/**
 * Style dependencies
 */
import './style.scss';
import cloudErrorIcon from './icons/cloud-error.svg';

const BackupFailed = ( { backup } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

	const getDisplayDate = useGetDisplayDate();
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const backupDate = applySiteOffset( backup.activityTs, { timezone, gmtOffset } );

	const displayDate = backupDate.format( 'L' );
	const displayTime = backupDate.format( 'LT' );

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudErrorIcon } alt="" role="presentation" />
				<div className="status-card__message-error">{ translate( 'Backup failed' ) }</div>
			</div>
			<div className="status-card__title">{ getDisplayDate( backup.activityTs, false ) }</div>
			<div className="status-card__label">
				<p>
					{ translate(
						'A backup for your site was attempted on %(displayDate)s at %(displayTime)s and was not ' +
							'able to be completed.',
						{ args: { displayDate, displayTime } }
					) }
				</p>
				<p>
					{ translate(
						'Check out the {{a}}backups help guide{{/a}} or contact our support team to resolve the ' +
							'issue.',
						{
							components: {
								a: (
									<a
										href="https://jetpack.com/support/backup/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
				<Button
					className="status-card__support-button"
					href={ contactSupportUrl( siteUrl ) }
					target="_blank"
					rel="noopener noreferrer"
					isPrimary={ false }
				>
					{ translate( 'Contact support' ) }
				</Button>
			</div>
		</>
	);
};

export default BackupFailed;
