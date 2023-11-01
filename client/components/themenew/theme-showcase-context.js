import { createContext } from 'react';

export const ThemeShowcaseContext = createContext( {
	filterString: '',
	query: {},
	themes: [],
} );

export default ThemeShowcaseContext;
