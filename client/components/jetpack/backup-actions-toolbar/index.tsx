import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { backupClonePath, backupMainPath } from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasBackups from 'calypso/state/rewind/selectors/site-has-backups';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BackupNowButton from '../backup-now-button';
import './style.scss';

interface Props {
	siteId: number;
}

const BackupActionsToolbar: FunctionComponent< Props > = ( { siteId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;
	const hasBackups = useSelector( ( state ) => siteHasBackups( state, siteId ) );

	// Show the "Copy site" button if accessing on Jetpack Cloud (A4A removed for now)
	const showCopySiteButton = isJetpackCloud();

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

	const onBackupNowClick = () => {
		// Redirect back to the main backup page when queueing a new backup
		page( backupMainPath( siteSlug ) );
	};

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
			{ showCopySiteButton && hasBackups && copySite }
			{ backupNow }
		</div>
	);
};

export default BackupActionsToolbar;
