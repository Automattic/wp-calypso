import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon, ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from 'calypso/components/forms/form-button';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { rewindBackupSite } from 'calypso/state/activity-log/actions';

import './style.scss';

export default function BackupWarningRetry( { siteId } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ disable, setDisable ] = useState( false );
	const requestBackupSite = useCallback(
		() => dispatch( rewindBackupSite( siteId ) ),
		[ dispatch, siteId ]
	);
	const trackedRequestBackupSite = useTrackCallback(
		requestBackupSite,
		'calypso_jetpack_backup_retry_click'
	);
	const retryText = translate( 'Retry' );
	const queuedText = translate( 'Retry queued' );
	const enqueueRetry = () => {
		trackedRequestBackupSite();
		setDisable( true );
	};
	const warningInfoLink = 'https://jetpack.com/support/backup/troubleshooting-jetpack-backup/';

	return (
		<div className="backup-warning-retry__wrapper">
			<div className="backup-warning-retry__info">
				<Gridicon icon="notice-outline" />
				{ translate( 'Some files failed to backup. {{ExternalLink}}Learn why.{{/ExternalLink}}', {
					components: {
						ExternalLink: (
							<ExternalLink
								href={ warningInfoLink }
								target="_blank"
								onClick={ () => recordTracksEvent( 'calypso_jetpack_backup_learn_why_click' ) }
							/>
						),
					},
				} ) }
			</div>
			<div className="backup-warning-retry__button-wrapper">
				<Button
					isPrimary
					className="backup-warning-retry__button"
					onClick={ enqueueRetry }
					disabled={ disable }
				>
					{ disable ? queuedText : retryText }
				</Button>
			</div>
		</div>
	);
}
