import { Icon, download as downloadIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import Button from 'calypso/components/forms/form-button';
import { backupContentsPath } from 'calypso/my-sites/backup/paths';

type DownloadButtonProps = {
	siteSlug: string;
	rewindId: string;
	isPrimary?: boolean;
};

const DownloadButton: FunctionComponent< DownloadButtonProps > = ( {
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
			className="toolbar__download-button"
		>
			<Icon icon={ downloadIcon } className="toolbar__download-button-icon" size={ 18 } />
			{ translate( 'Download backup' ) }
		</Button>
	);
};

export default DownloadButton;
