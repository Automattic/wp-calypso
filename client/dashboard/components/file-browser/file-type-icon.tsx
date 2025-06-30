import { Icon } from '@wordpress/components';
import {
	code,
	folder,
	media,
	page,
	plugins,
	audio,
	video,
	desktop,
	typography,
	globe,
	archive,
} from '@wordpress/icons';
import { FileType } from './types';

interface FileTypeIconProps {
	type: FileType;
}

const FileTypeIcon = ( { type }: FileTypeIconProps ) => {
	const getIcon = () => {
		switch ( type ) {
			case 'dir':
				return folder;
			case 'image':
				return media;
			case 'text':
				return page;
			case 'plugin':
				return plugins;
			case 'theme':
				return desktop;
			case 'table':
				return page;
			case 'audio':
				return audio;
			case 'video':
				return video;
			case 'fonts':
				return typography;
			case 'translations':
				return globe;
			case 'code':
				return code;
			case 'wordpress':
				return globe;
			case 'archive':
				return archive;
			default:
				return page;
		}
	};

	return <Icon icon={ getIcon() } size={ 18 } />;
};

export default FileTypeIcon;
