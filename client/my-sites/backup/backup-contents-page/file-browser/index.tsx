import { useState } from '@wordpress/element';
import { FunctionComponent } from 'react';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

interface FileBrowserProps {
	rewindId: number;
	restrictedTypes?: [ string ];
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( { rewindId, restrictedTypes } ) => {
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
			<FileBrowserHeader rewindId={ rewindId } />
			<FileBrowserNode
				rewindId={ rewindId }
				item={ rootItem }
				path="/"
				isAlternate
				setActiveNodePath={ handleClick }
				activeNodePath={ activeNodePath }
				restrictedTypes={ restrictedTypes }
			/>
		</div>
	);
};

export default FileBrowser;
