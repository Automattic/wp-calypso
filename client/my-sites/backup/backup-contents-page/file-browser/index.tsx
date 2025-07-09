import { useState } from '@wordpress/element';
import { FunctionComponent } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

export interface FileBrowserConfig {
	restrictedPaths?: string[];
	restrictedTypes?: string[];
	excludeTypes?: string[];
	alwaysInclude?: string[];
	showHeaderButtons?: boolean;
	showFileCard?: boolean;
	siteId?: number;
}

interface FileBrowserProps {
	rewindId: number;
	fileBrowserConfig?: FileBrowserConfig;
	siteId?: number;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( {
	rewindId,
	fileBrowserConfig,
	siteId,
} ) => {
	// This is the path of the node that is clicked
	const [ activeNodePath, setActiveNodePath ] = useState< string >( '' );
	const selectedSiteId = useSelector( getSelectedSiteId ) as number;
	const effectiveSiteId = siteId ?? selectedSiteId;

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
				showHeaderButtons={ fileBrowserConfig?.showHeaderButtons ?? true }
				siteId={ effectiveSiteId }
			/>
			<FileBrowserNode
				rewindId={ rewindId }
				item={ rootItem }
				path="/"
				isAlternate
				setActiveNodePath={ handleClick }
				activeNodePath={ activeNodePath }
				fileBrowserConfig={ fileBrowserConfig }
				siteId={ effectiveSiteId }
			/>
		</div>
	);
};

export default FileBrowser;
