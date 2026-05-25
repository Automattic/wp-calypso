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
	isReady: boolean,
	restoreOnUnmount: boolean
) {
	const hasAppliedTheme = useRef( false );
	const previousTheme = useRef< string | undefined >( undefined );

	useEffect( () => {
		if ( ! restoreOnUnmount || typeof document === 'undefined' ) {
			return;
		}

		return () => {
			if ( ! hasAppliedTheme.current ) {
				return;
			}

			if ( previousTheme.current === undefined ) {
				delete document.documentElement.dataset.theme;
				return;
			}

			document.documentElement.dataset.theme = previousTheme.current;
		};
	}, [ restoreOnUnmount ] );

	useEffect( () => {
		if ( ! isReady || typeof document === 'undefined' ) {
			return;
		}

		if ( restoreOnUnmount && ! hasAppliedTheme.current ) {
			previousTheme.current = document.documentElement.dataset.theme;
			hasAppliedTheme.current = true;
		}

		document.documentElement.dataset.theme = colorScheme;
	}, [ colorScheme, isReady, restoreOnUnmount ] );
}

export function ColorSchemeContextProvider( {
	children,
	colorScheme,
	isReady,
	restoreOnUnmount = false,
	setColorScheme,
	waitForReady,
}: {
	children: ReactNode;
	colorScheme: ColorScheme;
	isReady: boolean;
	restoreOnUnmount?: boolean;
	setColorScheme: ColorSchemeContextType[ 'setColorScheme' ];
	waitForReady: boolean;
} ) {
	useDocumentColorScheme( colorScheme, isReady, restoreOnUnmount );

	if ( waitForReady && ! isReady ) {
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
