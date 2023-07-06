import { FunctionComponent, useState } from 'react';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

interface FileBrowserProps {
	rewindId: number;
	siteId: number;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( { siteId, rewindId } ) => {
	// This is the path of the node that is clicked
	const [ activeNodePath, setActiveNodePath ] = useState< string >( '' );

	const handleClick = ( path: string ) => {
		setActiveNodePath( path );
	};

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
			setActiveNodePath={ handleClick }
			activeNodePath={ activeNodePath }
		/>
	);
};

export default FileBrowser;
