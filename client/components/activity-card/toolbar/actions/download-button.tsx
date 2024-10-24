import { download as downloadIcon, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import Button from 'calypso/components/forms/form-button';
import { backupDownloadPath } from 'calypso/my-sites/backup/paths';
import { useDispatch } from 'calypso/state';
import { rewindRequestBackup } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

type DownloadButtonProps = {
	siteId: number;
	siteSlug: string;
	rewindId: string;
};

const DownloadButton: FunctionComponent< DownloadButtonProps > = ( {
	siteId,
	siteSlug,
	rewindId,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const onDownloadClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_actions_download_click', {
				rewind_id: rewindId,
			} )
		);
		dispatch( rewindRequestBackup( siteId, rewindId ) );
	};
	return (
		<Button
			borderless
			compact
			isPrimary={ false }
			onClick={ onDownloadClick }
			href={ backupDownloadPath( siteSlug, rewindId ) }
			className="toolbar__download-button"
		>
			<Icon icon={ downloadIcon } className="toolbar__download-button-icon" size={ 18 } />
			{ translate( 'Download backup' ) }
		</Button>
	);
};

export default DownloadButton;
