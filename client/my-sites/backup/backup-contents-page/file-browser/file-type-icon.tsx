import { Icon } from '@wordpress/components';
import {
	blockTable,
	brush,
	file,
	image,
	pages,
	plugins,
	preformatted,
	typography,
	video,
	wordpress,
} from '@wordpress/icons';
import { FunctionComponent } from 'react';
import { FileType } from './types';

interface FileTypeIconProps {
	type: FileType;
}

const fileTypeToIcon: Record< FileType, JSX.Element > = {
	dir: file,
	image: image,
	text: preformatted,
	plugin: plugins,
	theme: brush,
	table: blockTable,
	audio: video,
	video: video,
	fonts: typography,
	translations: pages,
	code: pages,
	wordpress: wordpress,
	other: pages,
	archive: file,
};

const FileTypeIcon: FunctionComponent< FileTypeIconProps > = ( { type } ) => {
	const icon = fileTypeToIcon[ type ] || pages;

	return <Icon icon={ icon } />;
};

export default FileTypeIcon;
