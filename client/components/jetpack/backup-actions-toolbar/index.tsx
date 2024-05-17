import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { backupClonePath } from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasBackups from 'calypso/state/rewind/selectors/site-has-backups';
import BackupNowButton from '../backup-now-button';
import './style.scss';

interface Props {
	siteId: number;
	siteSlug: string;
	onBackupNowClick?: ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => void;
}

const BackupActionsToolbar: FunctionComponent< Props > = ( {
	siteId,
	siteSlug,
	onBackupNowClick,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasBackups = useSelector( ( state ) => siteHasBackups( state, siteId ) );

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
			onClick={ onBackupNowClick }
		>
			{ translate( 'Back up now' ) }
		</BackupNowButton>
	);

	return (
		<div className="jetpack-backup__actions-toolbar">
			{ hasBackups && copySite }
			{ backupNow }
		</div>
	);
};

export default BackupActionsToolbar;
