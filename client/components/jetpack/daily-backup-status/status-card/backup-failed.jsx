import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import { getBackupErrorCode } from 'calypso/lib/jetpack/backup-utils';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import useGetDisplayDate from '../use-get-display-date';
import cloudErrorIcon from './icons/cloud-error.svg';

import './style.scss';

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

	const mayBeBlockedByHost = getBackupErrorCode( backup ) === 'NOT_ACCESSIBLE';

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudErrorIcon } alt="" role="presentation" />
				<div className="status-card__message-error">{ translate( 'Backup failed' ) }</div>
			</div>
			<div className="status-card__title">
				{ mayBeBlockedByHost
					? translate( `We're having trouble backing up your site` )
					: getDisplayDate( backup.activityTs, false ) }
			</div>
			<div className="status-card__label">
				<div>
					{ mayBeBlockedByHost
						? translate(
								'Please {{b}}ask your hosting provider to allow connections{{/b}} from the IP addresses found on this page: {{a}}%(url)s{{/a}}',
								{
									components: {
										a: (
											<a
												href="https://jetpack.com/support/how-to-add-jetpack-ips-allowlist/"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
										b: <b />,
									},
									args: {
										url: 'https://jetpack.com/support/how-to-add-jetpack-ips-allowlist/',
									},
								}
						  )
						: translate(
								'A backup for your site was attempted on %(displayDate)s at %(displayTime)s and was not ' +
									'able to be completed.',
								{ args: { displayDate, displayTime } }
						  ) }
				</div>
				{ ! mayBeBlockedByHost && (
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
				) }
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
