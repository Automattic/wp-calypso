import config from '@automattic/calypso-config';
// import { Button } from '@automattic/components';
import { Button, Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { backupClonePath } from 'calypso/my-sites/backup/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BackupNowButton from '../backup-now-button';

interface Props {
	siteSlug: 'string';
}

const BackupActionsToolbar: FunctionComponent< Props > = ( { siteSlug } ) => {
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
		<BackupNowButton variant="primary" trackEventName="calypso_jetpack_backup_now">
			{ translate( 'Backup Now' ) }
		</BackupNowButton>
	);

	return (
		<>
			{ copySite }
			{ config.isEnabled( 'jetpack/backup-on-demand' ) && backupNow }
		</>
	);
};

export default BackupActionsToolbar;
