import { BackupBrowserItem } from 'calypso/state/rewind/browser/types';
import type { AppState } from 'calypso/types';

/**
 * Retrieves a backup browser node by path array.
 * @param state The application state.
 * @param siteId The site ID we're retrieving for.
 * @param pathList The path or array of paths leading to the node we want.
 * @returns A node in the backup browser state.
 */
const getBackupBrowserNode = (
	state: AppState,
	siteId: number,
	pathList: string[] | string
): BackupBrowserItem | undefined => {
	let currentNode = state.rewind[ siteId ]?.browser?.rootNode ?? undefined;
	if ( currentNode === undefined ) {
		return currentNode;
	}

	if ( pathList.length === 0 ) {
		return undefined;
	}

	if ( typeof pathList === 'string' ) {
		pathList = pathList.split( '/' );
		pathList = pathList.filter( ( pathPart ) => pathPart.length > 0 );
	}

	// We're starting at the root node so we'll remove it from the top of the array if it exists
	// If we got a string of '/' we may end up with 0 length now, but want the root.
	if ( pathList.length > 0 && pathList[ 0 ] === '/' ) {
		pathList.shift();
	}

	for ( const pathPart of pathList ) {
		const childNode = currentNode.children.find(
			( node: BackupBrowserItem ) => node.path === pathPart
		);
		if ( ! childNode ) {
			return undefined;
		}
		currentNode = childNode;
	}
	return currentNode;
};

export default getBackupBrowserNode;
