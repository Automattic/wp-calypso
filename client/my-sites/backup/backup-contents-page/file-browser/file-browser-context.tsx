import { createContext, useContext } from '@wordpress/element';
import { FileBrowserStateActions } from './types';
import { useFileBrowserState } from './use-file-browser-state';

interface FileBrowserContextValue {
	fileBrowserState: FileBrowserStateActions;
}

const FileBrowserContext = createContext< FileBrowserContextValue | null >( null );

export const useFileBrowserContext = () => {
	const context = useContext( FileBrowserContext );
	if ( ! context ) {
		throw new Error( 'useFileBrowserContext must be used within FileBrowserProvider' );
	}
	return context;
};

interface FileBrowserProviderProps {
	children: React.ReactNode;
}

/**
 * Provider that wraps backup pages with FileBrowser context
 */
export function FileBrowserProvider( { children }: FileBrowserProviderProps ) {
	const fileBrowserState = useFileBrowserState();

	return (
		<FileBrowserContext.Provider value={ { fileBrowserState } }>
			{ children }
		</FileBrowserContext.Provider>
	);
}
