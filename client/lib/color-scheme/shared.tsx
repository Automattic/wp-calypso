import { createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export type ColorScheme = 'light' | 'dark' | 'system';

export const PREFERENCE_KEY = 'hosting-dashboard-color-scheme';
export const DEFAULT_SCHEME: ColorScheme = 'light';

export function isColorScheme( value: unknown ): value is ColorScheme {
	return value === 'light' || value === 'dark' || value === 'system';
}

export interface ColorSchemeContextType {
	colorScheme: ColorScheme;
	setColorScheme: ( scheme: ColorScheme, options?: { onSuccess?: () => void } ) => void;
}

const ColorSchemeContext = createContext< ColorSchemeContextType | undefined >( undefined );

function useDocumentColorScheme(
	colorScheme: ColorScheme,
	active: boolean,
	restoreOnUnmount: boolean
) {
	const hasAppliedTheme = useRef( false );
	const previousTheme = useRef< string | undefined >( undefined );

	const restorePreviousTheme = () => {
		if ( ! hasAppliedTheme.current ) {
			return;
		}

		if ( previousTheme.current === undefined ) {
			delete document.documentElement.dataset.theme;
		} else {
			document.documentElement.dataset.theme = previousTheme.current;
		}

		hasAppliedTheme.current = false;
	};

	useEffect( () => {
		if ( ! restoreOnUnmount || typeof document === 'undefined' ) {
			return;
		}

		return restorePreviousTheme;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ restoreOnUnmount ] );

	useEffect( () => {
		if ( typeof document === 'undefined' ) {
			return;
		}

		// When the scheme is turned off without unmounting (e.g. navigating
		// away from a route that opts into it), put the previous theme back so
		// the rest of the app isn't left on the applied scheme.
		if ( ! active ) {
			if ( restoreOnUnmount ) {
				restorePreviousTheme();
			}
			return;
		}

		if ( restoreOnUnmount && ! hasAppliedTheme.current ) {
			previousTheme.current = document.documentElement.dataset.theme;
			hasAppliedTheme.current = true;
		}

		document.documentElement.dataset.theme = colorScheme;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ colorScheme, active, restoreOnUnmount ] );
}

export function ColorSchemeContextProvider( {
	children,
	colorScheme,
	enabled = true,
	isReady,
	restoreOnUnmount = false,
	setColorScheme,
	waitForReady,
}: {
	children: ReactNode;
	colorScheme: ColorScheme;
	enabled?: boolean;
	isReady: boolean;
	restoreOnUnmount?: boolean;
	setColorScheme: ColorSchemeContextType[ 'setColorScheme' ];
	waitForReady: boolean;
} ) {
	useDocumentColorScheme( colorScheme, enabled && isReady, restoreOnUnmount );

	// Keep children mounted when the scheme is disabled so toggling `enabled`
	// (e.g. once remote preferences load) doesn't unmount and remount the
	// wrapped subtree. The document side effects above are gated on `enabled`.
	if ( enabled && waitForReady && ! isReady ) {
		return null;
	}

	return (
		<ColorSchemeContext.Provider value={ { colorScheme, setColorScheme } }>
			{ children }
		</ColorSchemeContext.Provider>
	);
}

export function useColorScheme(): ColorSchemeContextType {
	const context = useContext( ColorSchemeContext );
	if ( context === undefined ) {
		throw new Error( 'useColorScheme must be used within a ColorSchemeProvider' );
	}
	return context;
}
