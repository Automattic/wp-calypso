import { useState } from '@wordpress/element';
import { FunctionComponent } from 'react';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

interface FileBrowserProps {
	rewindId: number;
	showHeaderButtons?: boolean;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( {
	rewindId,
	showHeaderButtons = true,
} ) => {
	// This is the path of the node that is clicked
	const [ activeNodePath, setActiveNodePath ] = useState< string >( '' );

	const handleClick = ( path: string ) => {
		setActiveNodePath( path );
	};

	const rootItem: FileBrowserItem = {
		name: '/',
		hasChildren: true,
		type: 'dir',
	};

	return (
		<div>
			<FileBrowserHeader rewindId={ rewindId } showHeaderButtons={ showHeaderButtons } />
			<FileBrowserNode
				rewindId={ rewindId }
				item={ rootItem }
				path="/"
				isAlternate
				setActiveNodePath={ handleClick }
				activeNodePath={ activeNodePath }
			/>
		</div>
	);
};

export default FileBrowser;
