import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ColorScheme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'wpcom_dashboard_color_scheme';
const DEFAULT_SCHEME: ColorScheme = 'light';

function isColorScheme( value: unknown ): value is ColorScheme {
	return value === 'light' || value === 'dark' || value === 'system';
}

function readStoredScheme(): ColorScheme {
	if ( typeof window === 'undefined' ) {
		return DEFAULT_SCHEME;
	}
	try {
		const stored = window.localStorage.getItem( STORAGE_KEY );
		if ( isColorScheme( stored ) ) {
			return stored;
		}
	} catch {
		// Access to localStorage can throw in privacy modes; fall through.
	}
	return DEFAULT_SCHEME;
}

function applyScheme( scheme: ColorScheme ) {
	if ( typeof document === 'undefined' ) {
		return;
	}
	document.documentElement.dataset.theme = scheme;
}

interface ColorSchemeContextType {
	colorScheme: ColorScheme;
	setColorScheme: ( scheme: ColorScheme ) => void;
}

const ColorSchemeContext = createContext< ColorSchemeContextType | undefined >( undefined );

export function ColorSchemeProvider( { children }: { children: React.ReactNode } ) {
	const [ colorScheme, setColorSchemeState ] = useState< ColorScheme >( readStoredScheme );

	useEffect( () => {
		applyScheme( colorScheme );
	}, [ colorScheme ] );

	const setColorScheme = useCallback( ( scheme: ColorScheme ) => {
		setColorSchemeState( scheme );
		try {
			window.localStorage.setItem( STORAGE_KEY, scheme );
		} catch {
			// Ignore storage failures; the in-memory state still updates.
		}
	}, [] );

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
