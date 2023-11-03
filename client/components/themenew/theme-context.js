import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext( {
	position: 1,
	selectedStyleVariation: {},
	setSelectedStyleVariation: () => {},
	themeId: '',
} );

export const useThemeContext = () => useContext( ThemeContext );

export function ThemeContextProvider( { children, position, themeId } ) {
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState();

	return (
		<ThemeContext.Provider
			value={ { position, selectedStyleVariation, setSelectedStyleVariation, themeId } }
		>
			{ children }
		</ThemeContext.Provider>
	);
}

export default ThemeContext;
