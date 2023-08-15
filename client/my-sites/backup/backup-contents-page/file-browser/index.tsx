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

	// Temporary values and logic for laying out header
	const [ currentlySelected, setCurrentlySelected ] = useState< number >( 0 );
	const totalElements = 10;
	const onToggleAll = ( checkedState?: boolean ) => {
		if ( checkedState ) {
			setCurrentlySelected( totalElements );
		} else {
			setCurrentlySelected( 0 );
		}
	};

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
					currentlySelected={ currentlySelected }
					totalElements={ totalElements }
					onToggleAll={ onToggleAll }
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
