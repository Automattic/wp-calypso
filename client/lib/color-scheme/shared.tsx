import { useEffect, useRef, createContext, useContext } from 'react';
import { WPDSThemeProvider, useResolvedColorScheme } from './wpds-theme';
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

/**
 * Transitional bridge: mirror the *resolved* light/dark mode onto the document
 * root as `data-theme="light|dark"`.
 *
 * The WPDS `ThemeProvider` is the source of truth for theming now — it sets the
 * actual `--wpds-*` token values. This attribute exists only so the SCSS that
 * has not yet been migrated to WPDS tokens (the legacy `when-dark-theme` mixin
 * and the per-surface `*-dark-theme`/`*-dark-mode` override sheets) keeps working
 * during the migration. Unlike the old implementation it never writes the raw
 * `system` value: the OS preference is resolved in JS, so downstream CSS only
 * needs to match `dark`. Each surface that adopts WPDS tokens removes its
 * dependency on this attribute, and the final migration step deletes it entirely.
 */
function useResolvedThemeAttribute(
	resolvedScheme: 'light' | 'dark',
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

		document.documentElement.dataset.theme = resolvedScheme;
	}, [ resolvedScheme, isReady, restoreOnUnmount ] );
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
	const resolvedScheme = useResolvedColorScheme( colorScheme );

	useResolvedThemeAttribute( resolvedScheme, isReady, restoreOnUnmount );

	if ( waitForReady && ! isReady ) {
		return null;
	}

	return (
		<ColorSchemeContext.Provider value={ { colorScheme, setColorScheme } }>
			<WPDSThemeProvider resolvedScheme={ resolvedScheme }>{ children }</WPDSThemeProvider>
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
