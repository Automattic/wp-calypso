import { createContext, RefObject } from 'react';

// This context is used to pass the ref of the theme showcase wrapper to the Theme component
// so it knows the correct boundaries for lazy loading the theme showcase images.
const ThemeShowcaseContext = createContext< {
	themeShowcaseWrapperRef: RefObject< HTMLDivElement > | undefined;
} >( {
	themeShowcaseWrapperRef: undefined,
} );

export default ThemeShowcaseContext;
