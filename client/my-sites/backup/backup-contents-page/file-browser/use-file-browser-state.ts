import { useState, useCallback } from '@wordpress/element';
import {
	FileBrowserCheckState,
	FileBrowserItem,
	FileBrowserNode,
	FileBrowserNodeType,
	FileBrowserNodeCheckList,
	FileBrowserState,
	FileBrowserStateActions,
	FileBrowserCheckListInfo,
} from './types';

const createInitialState = (): FileBrowserState => ( {
	rootNode: {
		id: '',
		path: '/',
		type: 'dir',
		ancestors: [],
		checkState: 'unchecked',
		childrenLoaded: false,
		children: [],
		totalItems: 0,
	},
} );

export function useFileBrowserState(): FileBrowserStateActions {
	const [ state, setState ] = useState< FileBrowserState >( createInitialState );

	const getNodeFromState = useCallback(
		( currentState: FileBrowserState, fullPath: string[] | string ): FileBrowserNode | null => {
			let currentNode = currentState.rootNode;

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
					( node: FileBrowserNode ) => node.path === pathPart
				);
				if ( ! childNode ) {
					return null;
				}
				currentNode = childNode;
			}
			return currentNode;
		},
		[]
	);

	const getParentAndIndex = useCallback(
		(
			currentState: FileBrowserState,
			fullPath: string[] | string
		): { parent?: FileBrowserNode; index?: number } => {
			let currentNode = currentState.rootNode;
			const result: { parent?: FileBrowserNode; index?: number } = {};

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
					( node: FileBrowserNode ) => node.path === pathPart
				);
				if ( ! childNode ) {
					return result;
				}
				result.parent = currentNode;
				result.index = currentNode.children.indexOf( childNode );

				currentNode = childNode;
			}
			return result;
		},
		[]
	);

	const updateChildrenStatus = useCallback(
		( nodeToUpdate: FileBrowserNode, status: 'checked' | 'unchecked' | 'mixed' ) => {
			for ( let i = 0; i < nodeToUpdate.children.length; i++ ) {
				const newChild = { ...nodeToUpdate.children[ i ] };
				newChild.checkState = status;
				nodeToUpdate.children[ i ] = newChild;
				if ( newChild.childrenLoaded && newChild.children.length > 0 ) {
					updateChildrenStatus( newChild, status );
				}
			}
		},
		[]
	);

	const getCheckedStatus = useCallback(
		( nodeToIterate: FileBrowserNode ): FileBrowserCheckState => {
			let isMixed = false;
			let isChecked = false;
			let isUnchecked = false;
			nodeToIterate.children.forEach( ( child: FileBrowserNode ) => {
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
		},
		[]
	);

	const fileBrowserToRestoreType = useCallback( ( type: string ): FileBrowserNodeType => {
		switch ( type ) {
			case 'table':
			case 'plugin':
			case 'theme':
				return type;
			default:
				return 'file';
		}
	}, [] );

	const updateParent = useCallback(
		( currentState: FileBrowserState, node: FileBrowserNode ): FileBrowserState => {
			if ( node.path === '/' ) {
				return currentState;
			}
			const nodePath = [ ...node.ancestors ];
			const { parent: parentOfParent, index } = getParentAndIndex( currentState, nodePath );
			// Root node is a special case
			if ( parentOfParent === undefined || index === undefined ) {
				const newRoot = { ...currentState.rootNode };
				newRoot.checkState = getCheckedStatus( newRoot );
				currentState.rootNode = newRoot;
				return currentState;
			}
			const newNode = { ...parentOfParent.children[ index ] };
			newNode.checkState = getCheckedStatus( newNode );
			parentOfParent.children[ index ] = newNode;
			return updateParent( currentState, newNode );
		},
		[ getParentAndIndex, getCheckedStatus ]
	);

	const setNodeCheckState = useCallback(
		( nodePath: string, checkState: FileBrowserCheckState ) => {
			setState( ( prevState ) => {
				const newState = { ...prevState };
				// Payload needs to give us the path to the node and the new checkState
				// We need to find the node in the tree
				// parent.children[0]
				const { parent, index } = getParentAndIndex( newState, nodePath );
				if ( ! parent || index === undefined ) {
					// Root node special case
					if ( '/' === nodePath ) {
						const newRoot = { ...newState.rootNode };
						newRoot.checkState = checkState;
						updateChildrenStatus( newRoot, checkState );
						newState.rootNode = newRoot;
						return newState;
					}
					return prevState;
				}
				const newNode = { ...parent.children[ index ] };
				const nodeToUpdate = getNodeFromState( prevState, nodePath );
				if ( ! nodeToUpdate ) {
					return prevState;
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
			} );
		},
		[ getParentAndIndex, getNodeFromState, updateChildrenStatus, updateParent ]
	);

	const addChildNodes = useCallback(
		( parentPath: string, childrenPaths: FileBrowserItem[] ) => {
			setState( ( prevState ) => {
				// Payload needs to give us the path to the parent and a list of children paths
				// We need to find the parent node in the tree
				const parentNode = getNodeFromState( prevState, parentPath );
				if ( ! parentNode ) {
					return prevState;
				}
				if ( parentNode.childrenLoaded ) {
					return prevState;
				}
				// We need to add the children to the parent node
				// They'll inherit the parent's state with default childrenLoading/Loaded/children values
				for ( const childPath of childrenPaths ) {
					parentNode.children.push( {
						id: childPath.id ?? '',
						path: childPath.path ?? childPath.name,
						type: fileBrowserToRestoreType( childPath.type ),
						ancestors: [ ...parentNode.ancestors, parentNode.path ],
						checkState: parentNode.checkState === 'checked' ? 'checked' : 'unchecked',
						childrenLoaded: false,
						children: [],
						totalItems: childPath.totalItems ?? 0,
					} );
				}

				parentNode.childrenLoaded = true;
				return prevState;
			} );
		},
		[ getNodeFromState, fileBrowserToRestoreType ]
	);

	const getNodeFullPath = useCallback( ( node: FileBrowserNode ): string => {
		let fullPath = node.ancestors.join( '/' ) + '/' + node.path;
		if ( node.ancestors[ 0 ] === '/' ) {
			fullPath = fullPath.slice( 1 );
		}
		return fullPath;
	}, [] );

	const addChildrenToList = useCallback(
		(
			currentNode: FileBrowserNode,
			currentList: FileBrowserNodeCheckList
		): FileBrowserNodeCheckList => {
			// If we're unchecked, just return back out, we shouldn't have any selected children
			if ( currentNode.checkState === 'unchecked' ) {
				return currentList;
			}

			// If we're in a directory and we're checked, we just add the directory path and return to include all children
			if ( currentNode.checkState === 'checked' ) {
				currentList.includeList.push( {
					id: currentNode.id,
					path: getNodeFullPath( currentNode ),
					type: currentNode.type,
				} );

				// If the current node is the root, let's go through direct children and
				// sum the `totalItems` of each of them.
				if ( currentNode.path === '/' ) {
					currentNode.children.forEach( ( node: FileBrowserNode ) => {
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
					type: currentNode.type,
				} );
				return currentList;
			}

			// If some children are selected determine if more or less than half are selected
			// If more than half are selected and we have no directories as children (no children have children)
			// then we can add the directory to the include list, and add all unselected items to the exclude list and return.
			const useExclusion =
				selectedChildren > totalChildren / 2 &&
				! currentNode.children.some( ( node: FileBrowserNode ) => {
					return node.children.length > 0;
				} );

			if ( useExclusion ) {
				currentList.includeList.push( {
					id: currentNode.id,
					path: getNodeFullPath( currentNode ),
					type: currentNode.type,
				} );

				currentNode.children.forEach( ( node: FileBrowserNode ) => {
					if ( node.checkState === 'checked' ) {
						currentList.totalItems += node.totalItems;
					}

					if ( node.checkState === 'unchecked' ) {
						currentList.excludeList.push( {
							id: node.id,
							path: getNodeFullPath( node ),
							type: node.type,
						} );
					}
				} );
				return currentList;
			}

			// For each selected child, add it to the inclusion list
			// For each mixed child, call addChildrenToList
			currentNode.children.forEach( ( node: FileBrowserNode ) => {
				if ( 'checked' === node.checkState ) {
					currentList.includeList.push( {
						id: node.id,
						path: getNodeFullPath( node ),
						type: node.type,
					} );
					currentList.totalItems += node.totalItems;
				}
				if ( 'mixed' === node.checkState ) {
					currentList = addChildrenToList( node, currentList );
				}
			} );
			return currentList;
		},
		[ getNodeFullPath ]
	);

	const addSelectedItemsToList = useCallback(
		(
			currentNode: FileBrowserNode,
			selectedList: FileBrowserCheckListInfo[]
		): FileBrowserCheckListInfo[] => {
			// If we're unchecked, skip this node and its children
			if ( currentNode.checkState === 'unchecked' ) {
				return selectedList;
			}

			// If we're checked, add this node
			if ( currentNode.checkState === 'checked' ) {
				selectedList.push( {
					id: currentNode.id,
					path: getNodeFullPath( currentNode ),
					type: currentNode.type,
				} );
				return selectedList;
			}

			// If we're mixed, recursively check children
			currentNode.children.forEach( ( node: FileBrowserNode ) => {
				selectedList = addSelectedItemsToList( node, selectedList );
			} );

			return selectedList;
		},
		[ getNodeFullPath ]
	);

	const getSelectedList = useCallback( (): FileBrowserCheckListInfo[] => {
		let selectedList: FileBrowserCheckListInfo[] = [];

		const currentNode = state.rootNode;
		if ( currentNode === undefined ) {
			return selectedList;
		}

		selectedList = addSelectedItemsToList( currentNode, selectedList );

		return selectedList;
	}, [ state.rootNode, addSelectedItemsToList ] );

	const getCheckList = useCallback( (): FileBrowserNodeCheckList => {
		let checkList: FileBrowserNodeCheckList = {
			totalItems: 0,
			includeList: [],
			excludeList: [],
		};

		const currentNode = state.rootNode;
		if ( currentNode === undefined ) {
			return checkList;
		}

		checkList = addChildrenToList( currentNode, checkList );

		return checkList;
	}, [ state.rootNode, addChildrenToList ] );

	const getNode = useCallback(
		( path: string ): FileBrowserNode | null => {
			return getNodeFromState( state, path );
		},
		[ state, getNodeFromState ]
	);

	return {
		getNode,
		getCheckList,
		getSelectedList,
		setNodeCheckState,
		addChildNodes,
	};
}
