import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import BackupNowButton from '../backup-now-button';

const BackupActionsToolbar: FunctionComponent = () => {
	const translate = useTranslate();

	const backupNow = (
		<BackupNowButton variant="primary" trackEventName="calypso_jetpack_backup_now">
			{ translate( 'Backup Now' ) }
		</BackupNowButton>
	);

	return <>{ config.isEnabled( 'jetpack/backup-on-demand' ) && backupNow }</>;
};

export default BackupActionsToolbar;
