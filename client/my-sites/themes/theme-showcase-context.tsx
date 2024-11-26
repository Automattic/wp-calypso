import { isMobileWidthOrHeight } from '@automattic/viewport';
import { createContext, FC, PropsWithChildren, RefObject } from 'react';
import { useMainRefContext } from 'calypso/components/main';

interface ThemeShowcaseContextInterface {
	themeShowcaseWrapperRef: RefObject< HTMLElement > | undefined;
}

// This context is used to pass the ref of the theme showcase wrapper to the Theme component
// so it knows the correct boundaries for lazy loading the theme showcase images.
export const ThemeShowcaseContext = createContext< ThemeShowcaseContextInterface >( {
	themeShowcaseWrapperRef: undefined,
} );

export const ThemeShowcaseContextProvider: FC<
	PropsWithChildren< ThemeShowcaseContextInterface & { isLoggedOut: boolean } >
> = ( { children, isLoggedOut, themeShowcaseWrapperRef } ) => {
	const { mainRef } = useMainRefContext();

	let refToUse = undefined;

	// When logged out, use the document viewport is used to determine the themes' lazy loading.
	if ( isLoggedOut ) {
		refToUse = undefined;
	}
	// On mobile devices, we rely on the <Main> component instead.
	else if ( isMobileWidthOrHeight() ) {
		refToUse = mainRef;
	}
	//Otherwise, rely on the theme showcase wrapper
	else {
		refToUse = themeShowcaseWrapperRef;
	}

	return (
		<ThemeShowcaseContext.Provider value={ { themeShowcaseWrapperRef: refToUse } }>
			{ children }
		</ThemeShowcaseContext.Provider>
	);
};
