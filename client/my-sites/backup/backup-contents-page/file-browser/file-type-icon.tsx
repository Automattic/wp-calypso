import { Icon } from '@wordpress/components';
import { file, pages } from '@wordpress/icons';
import { FunctionComponent } from 'react';
import { FileType } from './types';

interface FileTypeIconProps {
	type: FileType;
}

// @TODO: Add a filename prop and use it to determine the icon for files
const FileTypeIcon: FunctionComponent< FileTypeIconProps > = ( { type } ) => {
	switch ( type ) {
		case 'dir':
			return <Icon icon={ file } />;
		default:
			return <Icon icon={ pages } />;
	}
};

export default FileTypeIcon;
