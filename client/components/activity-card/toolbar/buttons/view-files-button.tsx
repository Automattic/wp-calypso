import { Icon, file as fileIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import Button from 'calypso/components/forms/form-button';
import { backupContentsPath } from 'calypso/my-sites/backup/paths';

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

	return (
		<Button
			borderless
			compact
			isPrimary={ isPrimary }
			href={ backupContentsPath( siteSlug, rewindId ) }
			className="toolbar__view-files-button"
		>
			<Icon icon={ fileIcon } className="toolbar__view-files-button-icon" size={ 18 } />
			<span className="toolbar__view-files-button-text">{ translate( 'View files' ) }</span>
		</Button>
	);
};

export default ViewFilesButton;
