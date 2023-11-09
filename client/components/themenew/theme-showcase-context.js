import { createContext, useContext } from 'react';

export const ThemeShowcaseContext = createContext( {
	bookmarkRef: null,
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
	bookmarkRef,
	filterString,
	locale,
	origin,
	query,
	tabFilter,
	themes,
} ) {
	const value = { bookmarkRef, filterString, locale, origin, query, tabFilter, themes };
	return (
		<ThemeShowcaseContext.Provider value={ value }>{ children }</ThemeShowcaseContext.Provider>
	);
}

export default ThemeShowcaseContext;
