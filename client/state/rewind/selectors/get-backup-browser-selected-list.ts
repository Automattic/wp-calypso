import { BackupBrowserItem, BackupBrowserSelectedItem } from 'calypso/state/rewind/browser/types';
import { AppState } from 'calypso/types';

const getNodeFullPath = ( node: BackupBrowserItem ): string => {
	let fullPath = node.ancestors.join( '/' ) + '/' + node.path;
	if ( node.ancestors[ 0 ] === '/' ) {
		fullPath = fullPath.slice( 1 );
	}
	return fullPath;
};

// Recursive function to iterate through tree and add items to the list
const addChildrenToList = (
	currentNode: BackupBrowserItem,
	currentList: BackupBrowserSelectedItem[]
): BackupBrowserSelectedItem[] => {
	// If we're unchecked, just return back out, we shouldn't have any selected children
	if ( currentNode.checkState === 'unchecked' ) {
		return currentList;
	}

	// If we're in a directory and we're checked, we just add the directory path and return to include all children
	if ( currentNode.checkState === 'checked' ) {
		currentList.push( {
			type: currentNode.type,
			path: getNodeFullPath( currentNode ),
		} );
		return currentList;
	}

	// For each directory we need to see how many children are selected in it
	const totalChildren = currentNode.children.length;
	const selectedChildren = currentNode.children.reduce(
		( accumulator, node ) => ( node.checkState !== 'checked' ? accumulator : accumulator + 1 ),
		0
	);

	// If all children are selected we add the directory itself to the list and return
	// This shouldn't hit, because the currentNode should be checked
	if ( totalChildren === selectedChildren ) {
		currentList.push( {
			type: currentNode.type,
			path: getNodeFullPath( currentNode ),
		} );
		return currentList;
	}

	// For each selected child, add it to the inclusion list
	// For each mixed child, call addChildrenToList
	currentNode.children.forEach( ( node: BackupBrowserItem ) => {
		if ( 'checked' === node.checkState ) {
			currentList.push( {
				type: node.type,
				path: getNodeFullPath( node ),
			} );
		}
		if ( 'mixed' === node.checkState ) {
			currentList = addChildrenToList( node, currentList );
		}
	} );
	return currentList;
};

/**
 * Retrieve the list of selected items
 * @param state The application state.
 * @param siteId The site ID we're retrieving for.
 * @returns A list of selected items.
 */
const getBackupBrowserSelectedList = (
	state: AppState,
	siteId: number
): BackupBrowserSelectedItem[] => {
	let selectedList: BackupBrowserSelectedItem[] = [];

	const currentNode = state.rewind[ siteId ]?.browser?.rootNode ?? undefined;
	if ( currentNode === undefined ) {
		return selectedList;
	}

	selectedList = addChildrenToList( currentNode, selectedList );

	return selectedList;
};

export default getBackupBrowserSelectedList;
