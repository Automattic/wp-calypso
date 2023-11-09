import { createContext, useContext } from 'react';

export const ThemeCollectionContext = createContext( {
	collectionId: '',
	position: 0,
} );

export const useThemeCollectionContext = () => useContext( ThemeCollectionContext );

export function ThemeCollectionContextProvider( { children, collectionId, position } ) {
	const value = { collectionId, position };
	return (
		<ThemeCollectionContext.Provider value={ value }>{ children }</ThemeCollectionContext.Provider>
	);
}

export default ThemeCollectionContext;
