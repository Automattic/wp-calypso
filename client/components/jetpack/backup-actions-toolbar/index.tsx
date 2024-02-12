import config from '@automattic/calypso-config';
import { Button, Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { backupClonePath } from 'calypso/my-sites/backup/paths';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BackupNowButton from '../backup-now-button';
import './style.scss';

interface Props {
	siteId: number;
	siteSlug: string;
}

const BackupActionsToolbar: FunctionComponent< Props > = ( { siteId, siteSlug } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const copySite = (
		<Tooltip
			text={ translate(
				'To test your site changes, migrate or keep your data safe in another site'
			) }
		>
			<Button
				className="backup__clone-button"
				href={ backupClonePath( siteSlug ) }
				onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_backup_copy_site' ) ) }
				variant="secondary"
			>
				{ translate( 'Copy site' ) }
			</Button>
		</Tooltip>
	);

	const backupNow = (
		<BackupNowButton
			siteId={ siteId }
			variant="primary"
			trackEventName="calypso_jetpack_backup_now"
		>
			{ translate( 'Backup now' ) }
		</BackupNowButton>
	);

	return (
		<div className="jetpack-backup__actions-toolbar">
			{ copySite }
			{ config.isEnabled( 'jetpack/backup-on-demand' ) && backupNow }
		</div>
	);
};

export default BackupActionsToolbar;
