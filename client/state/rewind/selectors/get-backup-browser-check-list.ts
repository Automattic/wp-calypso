import { BackupBrowserItem, BackupBrowserItemCheckList } from 'calypso/state/rewind/browser/types';
import type { AppState } from 'calypso/types';

// Recursive function to iterate through tree and add items to the list
const addChildrenToList = (
	currentNode: BackupBrowserItem,
	currentList: BackupBrowserItemCheckList
): BackupBrowserItemCheckList => {
	// If we're unchecked, just return back out, we shouldn't have any selected children
	if ( currentNode.checkState === 'unchecked' ) {
		return currentList;
	}

	// If we're in a directory and we're checked, we just add the directory path and return to include all children
	if ( currentNode.checkState === 'checked' ) {
		currentList.includeList.push( currentNode.path );
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
		currentList.includeList.push( currentNode.path );
		return currentList;
	}

	// If no children are selected we just return the currentList
	// This should't hit. No children are selected, but the state wasn't unchecked
	if ( 0 === selectedChildren ) {
		return currentList;
	}

	// If some children are selected determine if more or less than half are selected
	// If more than half are selected and we have no directories as children (no children have children)
	// then we can add the directory to the include list, and add all unselected items to the exclude list and return.
	const useExclusion =
		selectedChildren > totalChildren / 2 &&
		! currentNode.children.some( ( node: BackupBrowserItem ) => {
			return node.children.length > 0;
		} );

	if ( useExclusion ) {
		currentList.includeList.push( currentNode.path );
		currentNode.children.forEach( ( node: BackupBrowserItem ) => {
			if ( node.checkState === 'unchecked' ) {
				currentList.excludeList.push( node.path );
			}
		} );
		return currentList;
	}

	// For each selected child, add it to the inclusion list
	// For each mixed child, call addChildrenToList
	currentNode.children.forEach( ( node: BackupBrowserItem ) => {
		if ( 'checked' === node.checkState ) {
			currentList.includeList.push( node.path );
		}
		if ( 'mixed' === node.checkState ) {
			currentList = addChildrenToList( node, currentList );
		}
	} );
	return currentList;
};

// TODO: Properly calculate these values
const calculateTotalItems = ( checkList: BackupBrowserItemCheckList ) => {
	checkList.totalItems = checkList.includeList.length + checkList.excludeList.length;
	return checkList;
};

/**
 * Retrieve the list of checked items and totals from the Backup Browser
 *
 * @param state The application state.
 * @param siteId The site ID we're retrieving for.
 * @returns A node in the backup browser state.
 */
const getBackupBrowserCheckList = (
	state: AppState,
	siteId: number
): BackupBrowserItemCheckList => {
	let retVal: BackupBrowserItemCheckList = {
		totalItems: 0,
		includeList: [],
		excludeList: [],
	};

	const currentNode = state.rewind[ siteId ]?.browser?.rootNode ?? undefined;
	if ( currentNode === undefined ) {
		return retVal;
	}

	retVal = addChildrenToList( currentNode, retVal );
	retVal = calculateTotalItems( retVal );

	return retVal;
};

export default getBackupBrowserCheckList;
