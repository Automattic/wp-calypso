import { createContext, useContext, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ThemeContext = createContext( {
	position: 1,
	selectedStyleVariation: {},
	setSelectedStyleVariation: () => {},
	themeId: '',
} );

export const useThemeContext = () => useContext( ThemeContext );

export function ThemeContextProvider( { children, position, themeId } ) {
	/**
	 * @todo Generalize this selector
	 */
	const theme = useSelector(
		( state ) =>
			getTheme( state, 'wpcom', themeId ) ||
			getTheme( state, 'wporg', themeId ) ||
			getTheme( state, getSelectedSiteId( state ), themeId )
	);

	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState();

	return (
		<ThemeContext.Provider
			value={ { position, selectedStyleVariation, setSelectedStyleVariation, theme, themeId } }
		>
			{ children }
		</ThemeContext.Provider>
	);
}

export default ThemeContext;
