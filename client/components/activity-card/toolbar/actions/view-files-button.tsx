import { Icon, file as fileIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import Button from 'calypso/components/forms/form-button';
import { backupContentsPath } from 'calypso/my-sites/backup/paths';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

type ViewFilesButtonProps = {
	siteSlug: string;
	rewindId: string;
	isPrimary?: boolean;
};

const ViewFilesButton: FunctionComponent< ViewFilesButtonProps > = ( {
	siteSlug,
	rewindId,
	isPrimary = false,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const backupBrowserLink = backupContentsPath( siteSlug, rewindId );

	const onButtonClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_view_files_click' ) );
	};

	return (
		<Button
			borderless
			compact
			isPrimary={ isPrimary }
			href={ backupBrowserLink }
			className="toolbar__view-files-button"
			onClick={ onButtonClick }
		>
			<Icon icon={ fileIcon } className="toolbar__view-files-button-icon" size={ 18 } />
			<span className="toolbar__view-files-button-text">{ translate( 'View files' ) }</span>
		</Button>
	);
};

export default ViewFilesButton;
