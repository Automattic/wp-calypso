import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BackupTips from './backup-tips';
import cloudWarningIcon from './icons/cloud-warning.svg';

import './style.scss';

const NoBackupsOnSelectedDate = ( { selectedDate } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

	const displayDate = selectedDate.format( 'll' );
	const nextDate = selectedDate.clone().add( 1, 'days' );
	const displayNextDate = nextDate.format( 'll' );

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudWarningIcon } alt="" role="presentation" />
				<div className="status-card__title">{ translate( 'No backup' ) }</div>
			</div>

			<div className="status-card__label">
				<p>
					{ translate( 'The backup attempt for %(displayDate)s was delayed.', {
						args: { displayDate },
					} ) }
				</p>
				<p>
					{ translate(
						'But don’t worry, it was likely completed in the early hours the next morning. ' +
							'Check the following day, {{link}}%(displayNextDate)s{{/link}} or contact support if you still need help.',
						{
							args: { displayNextDate },
							components: {
								link: (
									<a
										href={ backupMainPath( siteSlug, {
											date: nextDate.format( INDEX_FORMAT ),
										} ) }
									/>
								),
							},
						}
					) }
				</p>
			</div>

			<Button
				className="status-card__support-button"
				href={ contactSupportUrl( siteUrl ) }
				target="_blank"
				rel="noopener noreferrer"
				isPrimary={ false }
			>
				{ translate( 'Contact support' ) }
			</Button>
			{ isEnabled( 'jetpack/backup-messaging-i3' ) && <BackupTips location="NO_BACKUPS" /> }
		</>
	);
};

export default NoBackupsOnSelectedDate;
