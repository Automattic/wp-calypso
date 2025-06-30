import { createContext, useContext, useReducer, ReactNode } from 'react';
import { FileBrowserState, FileBrowserNode, FileBrowserCheckState } from './types';

interface FileBrowserContextType {
	state: FileBrowserState;
	addChildNodes: ( parentPath: string, children: Omit< FileBrowserNode, 'checkState' >[] ) => void;
	setNodeCheckState: ( path: string, checkState: FileBrowserCheckState ) => void;
	setActiveNodePath: ( path: string ) => void;
	getNodeCheckState: ( path: string ) => FileBrowserCheckState;
}

const FileBrowserContext = createContext< FileBrowserContextType | undefined >( undefined );

type FileBrowserAction =
	| {
			type: 'ADD_CHILD_NODES';
			payload: { parentPath: string; children: Omit< FileBrowserNode, 'checkState' >[] };
	  }
	| { type: 'SET_NODE_CHECK_STATE'; payload: { path: string; checkState: FileBrowserCheckState } }
	| { type: 'SET_ACTIVE_NODE_PATH'; payload: { path: string } };

const calculateCheckState = (
	nodes: Record< string, FileBrowserNode >,
	parentPath: string,
	targetPath: string,
	newCheckState: FileBrowserCheckState
): FileBrowserCheckState => {
	const childPaths = Object.keys( nodes ).filter(
		( path ) =>
			path.startsWith( parentPath ) &&
			path !== parentPath &&
			path.indexOf( '/', parentPath.length + 1 ) === -1
	);

	if ( childPaths.length === 0 ) {
		return newCheckState;
	}

	const childStates = childPaths.map( ( path ) => {
		if ( path === targetPath ) {
			return newCheckState;
		}
		return nodes[ path ]?.checkState || 'unchecked';
	} );

	const checkedCount = childStates.filter( ( state ) => state === 'checked' ).length;
	const uncheckedCount = childStates.filter( ( state ) => state === 'unchecked' ).length;
	const mixedCount = childStates.filter( ( state ) => state === 'mixed' ).length;

	if ( checkedCount === childStates.length ) {
		return 'checked';
	}
	if ( uncheckedCount === childStates.length ) {
		return 'unchecked';
	}
	return 'mixed';
};

const updateParentCheckStates = (
	nodes: Record< string, FileBrowserNode >,
	targetPath: string,
	newCheckState: FileBrowserCheckState
): Record< string, FileBrowserNode > => {
	const updatedNodes = { ...nodes };

	const pathParts = targetPath.split( '/' ).filter( ( part ) => part !== '' );

	for ( let i = pathParts.length - 1; i > 0; i-- ) {
		const parentPath = '/' + pathParts.slice( 0, i ).join( '/' ) + '/';
		const normalizedParentPath = parentPath === '//' ? '/' : parentPath;

		if ( updatedNodes[ normalizedParentPath ] ) {
			const calculatedState = calculateCheckState(
				updatedNodes,
				normalizedParentPath,
				targetPath,
				newCheckState
			);
			updatedNodes[ normalizedParentPath ] = {
				...updatedNodes[ normalizedParentPath ],
				checkState: calculatedState,
			};
		}
	}

	return updatedNodes;
};

const updateChildCheckStates = (
	nodes: Record< string, FileBrowserNode >,
	parentPath: string,
	newCheckState: FileBrowserCheckState
): Record< string, FileBrowserNode > => {
	const updatedNodes = { ...nodes };

	Object.keys( updatedNodes ).forEach( ( path ) => {
		if ( path.startsWith( parentPath ) && path !== parentPath ) {
			updatedNodes[ path ] = {
				...updatedNodes[ path ],
				checkState: newCheckState === 'mixed' ? 'unchecked' : newCheckState,
			};
		}
	} );

	return updatedNodes;
};

const fileBrowserReducer = (
	state: FileBrowserState,
	action: FileBrowserAction
): FileBrowserState => {
	switch ( action.type ) {
		case 'ADD_CHILD_NODES': {
			const { parentPath, children } = action.payload;
			const newNodes = { ...state.nodes };

			children.forEach( ( child ) => {
				const childPath = `${ parentPath }${ child.path }/`;
				newNodes[ childPath ] = {
					...child,
					path: childPath,
					checkState: 'unchecked',
				};
			} );

			return {
				...state,
				nodes: newNodes,
			};
		}
		case 'SET_NODE_CHECK_STATE': {
			const { path, checkState } = action.payload;
			let updatedNodes = { ...state.nodes };

			if ( updatedNodes[ path ] ) {
				updatedNodes[ path ] = {
					...updatedNodes[ path ],
					checkState,
				};

				updatedNodes = updateChildCheckStates( updatedNodes, path, checkState );
				updatedNodes = updateParentCheckStates( updatedNodes, path, checkState );
			}

			return {
				...state,
				nodes: updatedNodes,
			};
		}
		case 'SET_ACTIVE_NODE_PATH': {
			return {
				...state,
				activeNodePath: action.payload.path,
			};
		}
		default:
			return state;
	}
};

const initialState: FileBrowserState = {
	nodes: {},
	activeNodePath: '',
};

interface FileBrowserProviderProps {
	children: ReactNode;
}

export const FileBrowserProvider = ( { children }: FileBrowserProviderProps ) => {
	const [ state, dispatch ] = useReducer( fileBrowserReducer, initialState );

	const addChildNodes = (
		parentPath: string,
		childNodes: Omit< FileBrowserNode, 'checkState' >[]
	) => {
		dispatch( {
			type: 'ADD_CHILD_NODES',
			payload: { parentPath, children: childNodes },
		} );
	};

	const setNodeCheckState = ( path: string, checkState: FileBrowserCheckState ) => {
		dispatch( {
			type: 'SET_NODE_CHECK_STATE',
			payload: { path, checkState },
		} );
	};

	const setActiveNodePath = ( path: string ) => {
		dispatch( {
			type: 'SET_ACTIVE_NODE_PATH',
			payload: { path },
		} );
	};

	const getNodeCheckState = ( path: string ): FileBrowserCheckState => {
		return state.nodes[ path ]?.checkState || 'unchecked';
	};

	const contextValue: FileBrowserContextType = {
		state,
		addChildNodes,
		setNodeCheckState,
		setActiveNodePath,
		getNodeCheckState,
	};

	return (
		<FileBrowserContext.Provider value={ contextValue }>{ children }</FileBrowserContext.Provider>
	);
};

export const useFileBrowser = (): FileBrowserContextType => {
	const context = useContext( FileBrowserContext );
	if ( ! context ) {
		throw new Error( 'useFileBrowser must be used within a FileBrowserProvider' );
	}
	return context;
};
