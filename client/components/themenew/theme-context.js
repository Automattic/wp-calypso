import { createContext, useContext, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useSelector } from 'calypso/state';
import { getTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ThemeContext = createContext( {
	selectedStyleVariation: {},
	setSelectedStyleVariation: () => {},
	themeId: '',
	themePosition: 0,
} );

export const useThemeContext = () => useContext( ThemeContext );

export function ThemeContextProvider( { children, themeId, themePosition } ) {
	/**
	 * @todo Generalize this selector
	 */
	const theme = useSelector(
		( state ) =>
			getTheme( state, 'wpcom', themeId ) ||
			getTheme( state, 'wporg', themeId ) ||
			getTheme( state, getSelectedSiteId( state ), themeId ),
		shallowEqual
	);

	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState();

	const value = {
		selectedStyleVariation,
		setSelectedStyleVariation,
		theme,
		themeId,
		themePosition,
	};

	return <ThemeContext.Provider value={ value }>{ children }</ThemeContext.Provider>;
}

export default ThemeContext;
