import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_CONTACT_SUPPORT, CALYPSO_CONTACT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import BackupTips from './backup-tips';
import cloudPendingIcon from './icons/cloud-pending.svg';

import './style.scss';

const NoBackupsYet = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );
	const siteName = useSelector( ( state ) => getRawSite( state, siteId ) )?.name;

	const dispatch = useDispatch();
	const onContactSupportClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_first_time_support_click' ) );
	}, [ dispatch ] );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_first_time_view' ) );
	}, [ dispatch ] );

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
					"No backups yet, but don't worry, one should become available soon.{{lineBreak/}}{{support}}Contact support{{/support}} if you still see this message after {{strong}}24 hours{{/strong}}, or if you still need help.",
					{
						components: {
							lineBreak: <br />,
							strong: <strong />,
							support: (
								<a
									{ ...( isJetpackCloud() || isA8CForAgencies()
										? {
												href: addQueryArgs(
													{ url: siteUrl },
													localizeUrl( JETPACK_CONTACT_SUPPORT )
												),
												target: '_blank',
												rel: 'noopener noreferrer',
												onClick: onContactSupportClick,
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
			{ isEnabled( 'jetpack/backup-messaging-i3' ) && <BackupTips location="NO_BACKUPS" /> }
		</>
	);
};

export default NoBackupsYet;
