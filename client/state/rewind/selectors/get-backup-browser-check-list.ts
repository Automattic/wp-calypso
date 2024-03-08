import { BackupBrowserItem, BackupBrowserItemCheckList } from 'calypso/state/rewind/browser/types';
import type { AppState } from 'calypso/types';

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
	currentList: BackupBrowserItemCheckList
): BackupBrowserItemCheckList => {
	// If we're unchecked, just return back out, we shouldn't have any selected children
	if ( currentNode.checkState === 'unchecked' ) {
		return currentList;
	}

	// If we're in a directory and we're checked, we just add the directory path and return to include all children
	if ( currentNode.checkState === 'checked' ) {
		currentList.includeList.push( {
			id: currentNode.id,
			path: getNodeFullPath( currentNode ),
		} );

		// If the current node is the root, let's go through direct children and
		// sum the `totalItems` of each of them.
		if ( currentNode.path === '/' ) {
			currentNode.children.forEach( ( node: BackupBrowserItem ) => {
				if ( node.checkState === 'checked' ) {
					currentList.totalItems += node.totalItems;
				}
			} );
		}

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
		currentList.includeList.push( {
			id: currentNode.id,
			path: getNodeFullPath( currentNode ),
		} );
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
		currentList.includeList.push( {
			id: currentNode.id,
			path: getNodeFullPath( currentNode ),
		} );

		currentNode.children.forEach( ( node: BackupBrowserItem ) => {
			if ( node.checkState === 'checked' ) {
				currentList.totalItems += node.totalItems;
			}

			if ( node.checkState === 'unchecked' ) {
				currentList.excludeList.push( {
					id: node.id,
					path: getNodeFullPath( node ),
				} );
			}
		} );
		return currentList;
	}

	// For each selected child, add it to the inclusion list
	// For each mixed child, call addChildrenToList
	currentNode.children.forEach( ( node: BackupBrowserItem ) => {
		if ( 'checked' === node.checkState ) {
			currentList.includeList.push( { id: node.id, path: getNodeFullPath( node ) } );
			currentList.totalItems += node.totalItems;
		}
		if ( 'mixed' === node.checkState ) {
			currentList = addChildrenToList( node, currentList );
		}
	} );
	return currentList;
};

/**
 * Retrieve the list of checked items and totals from the Backup Browser
 * @param state The application state.
 * @param siteId The site ID we're retrieving for.
 * @returns A list of items to include and exclude from a restore or download.
 */
const getBackupBrowserCheckList = (
	state: AppState,
	siteId: number
): BackupBrowserItemCheckList => {
	let checkList: BackupBrowserItemCheckList = {
		totalItems: 0,
		includeList: [],
		excludeList: [],
	};

	const currentNode = state.rewind[ siteId ]?.browser?.rootNode ?? undefined;
	if ( currentNode === undefined ) {
		return checkList;
	}

	checkList = addChildrenToList( currentNode, checkList );

	return checkList;
};

export default getBackupBrowserCheckList;
