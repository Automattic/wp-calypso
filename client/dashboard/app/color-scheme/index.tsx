import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect } from 'react';

export type ColorScheme = 'light' | 'dark' | 'system';

export const PREFERENCE_KEY = 'hosting-dashboard-color-scheme';
export const DEFAULT_SCHEME: ColorScheme = 'light';

export function isColorScheme( value: unknown ): value is ColorScheme {
	return value === 'light' || value === 'dark' || value === 'system';
}

function applyColorScheme( scheme: ColorScheme ) {
	if ( typeof document === 'undefined' ) {
		return;
	}
	document.documentElement.dataset.theme = scheme;
}

interface ColorSchemeContextType {
	colorScheme: ColorScheme;
	setColorScheme: ( scheme: ColorScheme, options?: { onSuccess?: () => void } ) => void;
}

const ColorSchemeContext = createContext< ColorSchemeContextType | undefined >( undefined );

export function ColorSchemeProvider( { children }: { children: React.ReactNode } ) {
	const { data: savedColorScheme, isError } = useQuery( userPreferenceQuery( PREFERENCE_KEY ) );
	const { mutate: saveColorScheme, isPending } = useMutation(
		userPreferenceOptimisticMutation( PREFERENCE_KEY )
	);
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME;
	const isReady = savedColorScheme !== undefined || isError;

	useEffect( () => {
		if ( ! isReady ) {
			return;
		}
		applyColorScheme( colorScheme );
	}, [ colorScheme, isReady ] );

	const setColorScheme = useCallback(
		( scheme: ColorScheme, options?: { onSuccess?: () => void } ) => {
			if ( ! isColorScheme( scheme ) || scheme === colorScheme || isPending ) {
				return;
			}

			saveColorScheme( scheme, {
				onSuccess: options?.onSuccess,
			} );
		},
		[ colorScheme, isPending, saveColorScheme ]
	);

	return isReady ? (
		<ColorSchemeContext.Provider value={ { colorScheme, setColorScheme } }>
			{ children }
		</ColorSchemeContext.Provider>
	) : null;
}

export function useColorScheme(): ColorSchemeContextType {
	const context = useContext( ColorSchemeContext );
	if ( context === undefined ) {
		throw new Error( 'useColorScheme must be used within a ColorSchemeProvider' );
	}
	return context;
}
