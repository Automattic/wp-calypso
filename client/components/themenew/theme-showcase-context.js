import { createContext, useContext } from 'react';

export const ThemeShowcaseContext = createContext( {
	filterString: '',
	locale: '',
	origin: 'wpcom',
	query: {},
	tabFilter: '',
	themes: [],
} );

export const useThemeShowcaseContext = () => useContext( ThemeShowcaseContext );

export function ThemeShowcaseContextProvider( {
	children,
	filterString,
	locale,
	origin,
	query,
	tabFilter,
	themes,
} ) {
	return (
		<ThemeShowcaseContext.Provider
			value={ { filterString, locale, origin, query, tabFilter, themes } }
		>
			{ children }
		</ThemeShowcaseContext.Provider>
	);
}

export default ThemeShowcaseContext;
