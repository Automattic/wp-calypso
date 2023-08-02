import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import { JETPACK_CONTACT_SUPPORT, CALYPSO_CONTACT } from 'calypso/lib/url/support';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import BackupTips from './backup-tips';
import cloudPendingIcon from './icons/cloud-pending.svg';

import './style.scss';

const NoBackupsYet = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const siteName = useSelector( ( state ) => getRawSite( state, siteId ) )?.name;

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudPendingIcon } alt="" role="presentation" />
				<div>
					{ translate( 'We are preparing to backup %s', {
						args: siteName,
						comment: '%s is the name of the site',
					} ) }
				</div>
			</div>
			<h2 className="status-card__title">
				{ translate( 'Your first backup will be ready soon' ) }
			</h2>
			<div className="status-card__label">
				{ translate(
					"No backups yet, but don't worry, one should become available soon. {{support}}Contact support{{/support}} if you still see this message after {{strong}}24 hours{{/strong}}, or if you still need help.",
					{
						components: {
							strong: <strong />,
							support: (
								<a
									{ ...( isJetpackCloud()
										? {
												href: addQueryArgs(
													{ url: siteUrl },
													localizeUrl( JETPACK_CONTACT_SUPPORT )
												),
												target: '_blank',
												rel: 'noopener noreferrer',
										  }
										: {
												href: CALYPSO_CONTACT,
										  } ) }
								/>
							),
						},
					}
				) }
			</div>
			<ul className="status-card__link-list">
				<li>
					<ExternalLink href={ siteUrl }>{ translate( 'Visit your website' ) }</ExternalLink>
				</li>
				<li>
					<ExternalLink href={ adminUrl }>{ translate( 'Manage your website' ) }</ExternalLink>
				</li>
			</ul>
			{ isEnabled( 'jetpack/backup-messaging-i3' ) && <BackupTips location="NO_BACKUPS" /> }
		</>
	);
};

export default NoBackupsYet;
