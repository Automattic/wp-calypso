import { useState } from '@wordpress/element';
import { FunctionComponent } from 'react';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

export interface FileBrowserFilterConfig {
	restrictedPaths?: string[];
	restrictedTypes?: string[];
	excludeTypes?: string[];
	alwaysInclude?: string[];
	showHeaderButtons?: boolean;
	showFileCard?: boolean;
}

interface FileBrowserProps {
	rewindId: number;
	filterConfig?: FileBrowserFilterConfig;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( { rewindId, filterConfig } ) => {
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
			<FileBrowserHeader
				rewindId={ rewindId }
				showHeaderButtons={ filterConfig?.showHeaderButtons ?? true }
			/>
			<FileBrowserNode
				rewindId={ rewindId }
				item={ rootItem }
				path="/"
				isAlternate
				setActiveNodePath={ handleClick }
				activeNodePath={ activeNodePath }
				filterConfig={ filterConfig }
			/>
		</div>
	);
};

export default FileBrowser;
