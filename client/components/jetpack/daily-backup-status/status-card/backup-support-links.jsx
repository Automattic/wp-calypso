import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';

const BackupSupportLinks = ( { siteUrl } ) => {
	const translate = useTranslate();
	const troubleshootingLink = 'https://jetpack.com/support/backup/troubleshooting-jetpack-backup/';
	const fixConnectionIssuesLink =
		'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/';

	return (
		<div className="backup-support-links__wrapper">
			<div>
				<b>{ translate( 'Do you need any help?' ) }</b>
			</div>
			<div className="backup-support-links__links">
				<div>
					<ExternalLink href={ troubleshootingLink } target="_blank">
						{ translate( 'Troubleshooting tips' ) }
					</ExternalLink>
				</div>
				<div>
					<ExternalLink href={ fixConnectionIssuesLink } target="_blank">
						{ translate( 'How to fix connection issues' ) }
					</ExternalLink>
				</div>
				<div>
					<ExternalLink href={ contactSupportUrl( siteUrl ) } target="_blank">
						{ translate( 'Contact Jetpack support' ) }
					</ExternalLink>
				</div>
			</div>
		</div>
	);
};

export default BackupSupportLinks;
