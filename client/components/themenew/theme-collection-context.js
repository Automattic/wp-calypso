import { createContext, useContext } from 'react';

export const ThemeCollectionContext = createContext( {
	collectionId: '',
	collectionPosition: 0,
} );

export const useThemeCollectionContext = () => useContext( ThemeCollectionContext );

export function ThemeCollectionContextProvider( { children, collectionId, collectionPosition } ) {
	const value = { collectionId, collectionPosition };
	return (
		<ThemeCollectionContext.Provider value={ value }>{ children }</ThemeCollectionContext.Provider>
	);
}

export default ThemeCollectionContext;
