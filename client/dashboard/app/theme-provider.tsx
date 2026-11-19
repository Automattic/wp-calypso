import { LIGHT_SEEDS } from 'calypso/lib/color-scheme/seeds';
import { ColorSchemeThemeProvider } from 'calypso/lib/color-scheme/theme-provider';
import type { ReactNode } from 'react';

const LIGHT_SEEDS = {
	background: '#fcfcfc',
	primary: '#3858e9',
};

const DARK_SEEDS = {
	background: '#181818',
	primary: '#93aef8',
};

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
	return (
		<ColorSchemeThemeProvider enabled={ enabled } lightSeeds={ LIGHT_SEEDS }>
			{ children }
		</ColorSchemeThemeProvider>
	);
}
