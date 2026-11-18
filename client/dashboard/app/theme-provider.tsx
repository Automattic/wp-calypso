import { useMediaQuery } from '@wordpress/compose';
import { ThemeProvider } from '@wordpress/theme';
import { useColorScheme } from 'calypso/lib/color-scheme/shared';
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
	const { colorScheme } = useColorScheme();
	const prefersDark = useMediaQuery( '(prefers-color-scheme: dark)' );
	const isPrint = useMediaQuery( 'print' );
	const isDark =
		enabled &&
		! isPrint &&
		( colorScheme === 'dark' || ( colorScheme === 'system' && prefersDark ) );

	return (
		<ThemeProvider isRoot color={ isDark ? DARK_SEEDS : LIGHT_SEEDS }>
			{ children }
		</ThemeProvider>
	);
}
