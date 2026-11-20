import { Icon } from '@wordpress/components';
import {
	blockTable,
	brush,
	folder,
	image,
	pages,
	plugins,
	preformatted,
	typography,
	video,
	wordpress,
} from '@wordpress/icons';
import { FileType } from './types';
import type { JSX } from 'react';

interface FileTypeIconProps {
	type: FileType;
}

const fileTypeToIcon: Record< FileType, JSX.Element > = {
	dir: folder,
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
	archive: folder,
};

function FileTypeIcon( { type }: FileTypeIconProps ) {
	const icon = fileTypeToIcon[ type ] || pages;

	return <Icon icon={ icon } />;
}

export default FileTypeIcon;
