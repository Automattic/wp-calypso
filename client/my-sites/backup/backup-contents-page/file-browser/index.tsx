import config from '@automattic/calypso-config';
import { FunctionComponent, useState } from 'react';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

interface FileBrowserProps {
	rewindId: number;
	siteId: number;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( { siteId, rewindId } ) => {
	// This is the path of the node that is clicked
	const [ activeNodePath, setActiveNodePath ] = useState< string >( '' );
	const [ showCheckboxes, setShowCheckboxes ] = useState< boolean >( false );

	const handleClick = ( path: string ) => {
		setActiveNodePath( path );
	};

	const rootItem: FileBrowserItem = {
		name: '/',
		type: 'dir',
		hasChildren: true,
	};

	const isGranularEnabled = config.isEnabled( 'jetpack/backup-granular' );

	return (
		<div>
			{ isGranularEnabled && (
				<FileBrowserHeader
					showCheckboxes={ showCheckboxes }
					setShowCheckboxes={ setShowCheckboxes }
				/>
			) }
			<FileBrowserNode
				siteId={ siteId }
				rewindId={ rewindId }
				item={ rootItem }
				path="/"
				isAlternate={ true }
				setActiveNodePath={ handleClick }
				activeNodePath={ activeNodePath }
			/>
		</div>
	);
};

export default FileBrowser;
