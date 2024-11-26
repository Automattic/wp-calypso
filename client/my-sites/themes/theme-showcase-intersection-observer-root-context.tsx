import { isMobileWidthOrHeight } from '@automattic/viewport';
import { createContext, FC, PropsWithChildren, RefObject } from 'react';
import { useMainRefContext } from 'calypso/components/main';

interface ThemeShowcaseIntersectionObserverRootContextInterface {
	themeShowcaseIntersectionObserverRootRef: RefObject< HTMLElement > | undefined;
}

// The theme showcase has different layouts depending on whether it's desktop, mobile, or logged out.
// Because of that, the root element to be used on the IntersectionObserver that handles the lazy
// loading of themes is different depending on the scenario, and will be provided by this context.
export const ThemeShowcaseIntersectionObserverRootContext =
	createContext< ThemeShowcaseIntersectionObserverRootContextInterface >( {
		themeShowcaseIntersectionObserverRootRef: undefined,
	} );

export const ThemeShowcaseIntersectionObserverRootContextProvider: FC<
	PropsWithChildren< { isLoggedOut: boolean; themeShowcaseWrapperRef: RefObject< HTMLElement > } >
> = ( { children, isLoggedOut, themeShowcaseWrapperRef } ) => {
	const { mainRef } = useMainRefContext();

	let refToUse = undefined;

	// When logged out, use the document viewport to determine the themes' lazy loading.
	if ( isLoggedOut ) {
		refToUse = undefined;
	}
	// On mobile devices, use the <Main> component instead.
	else if ( isMobileWidthOrHeight() ) {
		refToUse = mainRef;
	}
	// Otherwise, use the theme showcase wrapper
	else {
		refToUse = themeShowcaseWrapperRef;
	}

	return (
		<ThemeShowcaseIntersectionObserverRootContext.Provider
			value={ { themeShowcaseIntersectionObserverRootRef: refToUse } }
		>
			{ children }
		</ThemeShowcaseIntersectionObserverRootContext.Provider>
	);
};
