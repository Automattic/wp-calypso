import { LIGHT_SEEDS } from 'calypso/lib/color-scheme/seeds';
import { ColorSchemeThemeProvider } from 'calypso/lib/color-scheme/theme-provider';
import type { ReactNode } from 'react';

/**
 * Applies the WPDS theme for the user's color scheme to the whole document, or nothing when the app has no color schemes.
 */
export function DashboardThemeProvider( {
	children,
	enabled,
}: {
	children: ReactNode;
	enabled: boolean;
} ) {
	if ( ! enabled ) {
		return children;
	}

	return (
		<ColorSchemeThemeProvider enabled lightSeeds={ LIGHT_SEEDS }>
			{ children }
		</ColorSchemeThemeProvider>
	);
}
