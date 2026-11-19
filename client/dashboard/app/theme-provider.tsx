import { useEffect, useLayoutEffect } from 'react';
import { LIGHT_SEEDS } from 'calypso/lib/color-scheme/seeds';
import { useColorScheme } from 'calypso/lib/color-scheme/shared';
import { ColorSchemeThemeProvider } from 'calypso/lib/color-scheme/theme-provider';
import { COLOR_SCHEME_STORAGE_KEY } from './theme-pre-paint';
import type { ReactNode } from 'react';

/**
 * Applies the WPDS theme for the user's color scheme to the whole document.
 */
export function DashboardThemeProvider( {
	children,
	enabled,
}: {
	children: ReactNode;
	enabled: boolean;
} ) {
	const { colorScheme } = useColorScheme();

	useEffect( () => {
		try {
			window.localStorage.setItem( COLOR_SCHEME_STORAGE_KEY, enabled ? colorScheme : 'light' );
		} catch {}
	}, [ enabled, colorScheme ] );

	useLayoutEffect( () => {
		delete document.documentElement.dataset.prePaintTheme;
	}, [] );

	return (
		<ColorSchemeThemeProvider enabled={ enabled } lightSeeds={ LIGHT_SEEDS }>
			{ children }
		</ColorSchemeThemeProvider>
	);
}
