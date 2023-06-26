import { FunctionComponent } from 'react';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

interface FileBrowserProps {
	rewindId: number;
	siteId: number;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( { siteId, rewindId } ) => {
	const rootItem: FileBrowserItem = {
		name: '/',
		type: 'dir',
		hasChildren: true,
	};

	return (
		<FileBrowserNode
			siteId={ siteId }
			rewindId={ rewindId }
			item={ rootItem }
			path="/"
			isAlternate={ true }
		/>
	);
};

export default FileBrowser;
