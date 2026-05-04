import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
	applyColorScheme,
	readStoredColorScheme,
	saveStoredColorScheme,
	type ColorScheme,
} from 'calypso/lib/color-scheme';

interface ColorSchemeContextType {
	colorScheme: ColorScheme;
	setColorScheme: ( scheme: ColorScheme ) => void;
}

const ColorSchemeContext = createContext< ColorSchemeContextType | undefined >( undefined );

export function ColorSchemeProvider( { children }: { children: React.ReactNode } ) {
	const [ colorScheme, setColorSchemeState ] = useState< ColorScheme >( readStoredColorScheme );

	useEffect( () => {
		applyColorScheme( colorScheme );
	}, [ colorScheme ] );

	const setColorScheme = useCallback( ( scheme: ColorScheme ) => {
		setColorSchemeState( scheme );
		saveStoredColorScheme( scheme );
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
