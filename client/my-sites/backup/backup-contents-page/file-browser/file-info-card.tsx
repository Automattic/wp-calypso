import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { FileBrowserItem } from './types';

interface FileInfoCardProps {
	item: FileBrowserItem;
}

const FileInfoCard: FunctionComponent< FileInfoCardProps > = ( { item } ) => {
	const translate = useTranslate();

	// Do not display file info if the item hasChildren (it could be a directory, plugins, themes, etc.)
	if ( item.hasChildren ) {
		return null;
	}

	// Temporary: display the file info only for database tables
	if ( item.type !== 'table' ) {
		return null;
	}

	return (
		<div className="file-card">
			<div className="file-card__details">
				<div className="file-card__row">
					<span className="file-card__label">{ translate( 'Rows:' ) } </span>
					<span className="file-card__value">{ item.rowCount }</span>
				</div>
			</div>
			<div className="file-card__actions"></div>
		</div>
	);
};

export default FileInfoCard;
