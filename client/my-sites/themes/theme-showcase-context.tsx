import { isMobileWidthOrHeight } from '@automattic/viewport';
import { createContext, FC, PropsWithChildren, RefObject } from 'react';

interface ThemeShowcaseContextInterface {
	themeShowcaseWrapperRef: RefObject< HTMLDivElement > | undefined;
}

// This context is used to pass the ref of the theme showcase wrapper to the Theme component
// so it knows the correct boundaries for lazy loading the theme showcase images.
export const ThemeShowcaseContext = createContext< ThemeShowcaseContextInterface >( {
	themeShowcaseWrapperRef: undefined,
} );

export const ThemeShowcaseContextProvider: FC<
	PropsWithChildren< ThemeShowcaseContextInterface & { isLoggedOut: boolean } >
> = ( { children, isLoggedOut, themeShowcaseWrapperRef } ) => {
	// When the user is logged in and not on a mobile device, we need to pass the ref to the theme
	// showcase wrapper so it is used to determine the themes' lazy loading. Otherwise, the document
	// viewport is used directly.
	const shouldUseShowcaseWrapperAsIntersectionObserverRoot =
		! isLoggedOut && ! isMobileWidthOrHeight();

	return (
		<ThemeShowcaseContext.Provider
			value={ {
				themeShowcaseWrapperRef: shouldUseShowcaseWrapperAsIntersectionObserverRoot
					? themeShowcaseWrapperRef
					: undefined,
			} }
		>
			{ children }
		</ThemeShowcaseContext.Provider>
	);
};
