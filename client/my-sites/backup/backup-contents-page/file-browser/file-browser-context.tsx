import { createContext, useContext } from '@wordpress/element';
import { FileBrowserStateActions } from './types';
import { useFileBrowserState } from './use-file-browser-state';

interface FileBrowserContextValue {
	fileBrowserState: FileBrowserStateActions;
	locale: string;
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
	locale: string;
}

/**
 * Provider that wraps backup pages with FileBrowser context
 */
export function FileBrowserProvider( { children, locale }: FileBrowserProviderProps ) {
	const fileBrowserState = useFileBrowserState();

	return (
		<FileBrowserContext.Provider value={ { fileBrowserState, locale } }>
			{ children }
		</FileBrowserContext.Provider>
	);
}
