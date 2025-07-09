import { useState } from '@wordpress/element';
import { FunctionComponent } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

interface FileBrowserProps {
	rewindId: number;
	showHeaderButtons?: boolean;
	siteId?: number;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( {
	rewindId,
	showHeaderButtons = true,
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
				showHeaderButtons={ showHeaderButtons }
				siteId={ effectiveSiteId }
			/>
			<FileBrowserNode
				rewindId={ rewindId }
				item={ rootItem }
				path="/"
				isAlternate
				setActiveNodePath={ handleClick }
				activeNodePath={ activeNodePath }
				siteId={ effectiveSiteId }
			/>
		</div>
	);
};

export default FileBrowser;
