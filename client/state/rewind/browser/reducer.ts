import { AnyAction } from 'redux';
import {
	JETPACK_BACKUP_BROWSER_ADD_CHILDREN,
	JETPACK_BACKUP_BROWSER_SET_CHECK_STATE,
} from 'calypso/state/action-types';
import { BackupBrowserItem } from 'calypso/state/rewind/browser/types';
import type { AppState } from 'calypso/types';

const initialState: AppState = {
	rootNode: {
		path: '/',
		ancestors: [],
		checkState: 'unchecked',
		childrenLoaded: false,
		children: [],
		totalItems: 0,
	},
};

const getNode = ( state: AppState, fullPath: string[] | string ) => {
	let currentNode = state.rootNode;

	if ( fullPath.length === 0 ) {
		return null;
	}

	if ( typeof fullPath === 'string' ) {
		fullPath = fullPath.split( '/' );
		fullPath = fullPath.filter( ( pathPart ) => pathPart.length > 0 );
	}

	// We're starting at the root node so we'll remove it from the top of the array if it exists
	if ( fullPath.length > 0 && fullPath[ 0 ] === '/' ) {
		fullPath.shift();
	}

	for ( const pathPart of fullPath ) {
		const childNode = currentNode.children.find(
			( node: BackupBrowserItem ) => node.path === pathPart
		);
		if ( ! childNode ) {
			return null;
		}
		currentNode = childNode;
	}
	return currentNode;
};

const getParentAndIndex = (
	state: AppState,
	fullPath: string[] | string
): { parent: BackupBrowserItem | undefined; index: number | undefined } => {
	let currentNode = state.rootNode;
	const result = {
		parent: undefined,
		index: undefined,
	};

	if ( fullPath.length === 0 ) {
		return result;
	}

	if ( typeof fullPath === 'string' ) {
		fullPath = fullPath.split( '/' );
		fullPath = fullPath.filter( ( pathPart ) => pathPart.length > 0 );
	}

	// We're starting at the root node so we'll remove it from the top of the array if it exists
	if ( fullPath.length > 0 && fullPath[ 0 ] === '/' ) {
		fullPath.shift();
	}

	for ( const pathPart of fullPath ) {
		const childNode = currentNode.children.find(
			( node: BackupBrowserItem ) => node.path === pathPart
		);
		if ( ! childNode ) {
			return result;
		}
		result.parent = currentNode;
		result.index = currentNode.children.indexOf( childNode );

		currentNode = childNode;
	}
	return result;
};

const updateChildrenStatus = (
	nodeToUpdate: BackupBrowserItem,
	status: 'checked' | 'unchecked' | 'mixed'
) => {
	for ( let i = 0; i < nodeToUpdate.children.length; i++ ) {
		const newChild = { ...nodeToUpdate.children[ i ] };
		newChild.checkState = status;
		nodeToUpdate.children[ i ] = newChild;
		if ( newChild.childrenLoaded && newChild.children.length > 0 ) {
			updateChildrenStatus( newChild, status );
		}
	}
};

// Update the status of the current node based on any children
const getCheckedStatus = ( nodeToIterate: BackupBrowserItem ) => {
	let isMixed = false;
	let isChecked = false;
	let isUnchecked = false;
	nodeToIterate.children.forEach( ( child: BackupBrowserItem ) => {
		if ( child.checkState === 'mixed' ) {
			isMixed = true;
		} else if ( child.checkState === 'checked' ) {
			isChecked = true;
		} else {
			isUnchecked = true;
		}
	} );
	if ( isMixed ) {
		return 'mixed';
	} else if ( isChecked && isUnchecked ) {
		return 'mixed';
	} else if ( isChecked ) {
		return 'checked';
	}
	return 'unchecked';
};

const fileBrowserToRestoreType = ( type: string ) => {
	switch ( type ) {
		case 'table':
		case 'plugin':
		case 'theme':
			return type;
		default:
			return 'file';
	}
};

const updateParent = ( state: AppState, node: BackupBrowserItem ): AppState => {
	if ( node.path === '/' ) {
		return state;
	}
	const nodePath = [ ...node.ancestors ];
	const { parent: parentOfParent, index } = getParentAndIndex( state, nodePath );
	// Root node is a special case
	if ( parentOfParent === undefined || index === undefined ) {
		const newRoot = { ...state.rootNode };
		newRoot.checkState = getCheckedStatus( newRoot );
		state.rootNode = newRoot;
		return state;
	}
	const newNode = { ...parentOfParent.children[ index ] };
	newNode.checkState = getCheckedStatus( newNode );
	parentOfParent.children[ index ] = newNode;
	return updateParent( state, newNode );
};

export default ( state = initialState, { type, payload }: AnyAction ) => {
	switch ( type ) {
		case JETPACK_BACKUP_BROWSER_SET_CHECK_STATE: {
			const newState = { ...state };
			// Payload needs to give us the path to the node and the new checkState
			const { nodePath, checkState } = payload;
			// We need to find the node in the tree
			// parent.children[0]
			const { parent, index } = getParentAndIndex( newState, nodePath );
			if ( ! parent || index === undefined ) {
				// Root node special case
				if ( '/' === nodePath ) {
					const newState = { ...state };
					const newRoot = { ...newState.rootNode };
					newRoot.checkState = checkState;
					updateChildrenStatus( newRoot, checkState );
					newState.rootNode = newRoot;
					return newState;
				}
				return state;
			}
			const newNode = { ...parent.children[ index ] };
			const nodeToUpdate = getNode( state, nodePath );
			if ( ! nodeToUpdate ) {
				return state;
			}
			// We need to update the node's checkState
			newNode.checkState = checkState;
			parent.children[ index ] = newNode;
			// We need to update the node's children's checkState
			if ( checkState !== 'mixed' ) {
				updateChildrenStatus( newNode, checkState );
			}
			updateParent( newState, newNode );
			return newState;
		}
		case JETPACK_BACKUP_BROWSER_ADD_CHILDREN: {
			// Payload needs to give us the path to the parent and a list of children paths
			const { parentPath, childrenPaths } = payload;
			// We need to find the parent node in the tree
			const parentNode = getNode( state, parentPath );
			if ( ! parentNode ) {
				return state;
			}
			if ( parentNode.childrenLoaded ) {
				return state;
			}
			// We need to add the children to the parent node
			// They'll inherit the parent's state with default childrenLoading/Loaded/children values
			for ( const childPath of childrenPaths ) {
				parentNode.children.push( {
					id: childPath.id,
					path: childPath.path,
					type: fileBrowserToRestoreType( childPath.type ),
					ancestors: [ ...parentNode.ancestors, parentNode.path ],
					checkState: parentNode.checkState === 'checked' ? 'checked' : 'unchecked',
					childrenLoaded: false,
					children: [],
					totalItems: childPath.totalItems,
				} );
			}

			parentNode.childrenLoaded = true;
			return state;
		}
		default:
			return state;
	}
};
