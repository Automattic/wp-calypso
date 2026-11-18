import { useMediaQuery } from '@wordpress/compose';
import { ThemeProvider } from '@wordpress/theme';
import { useEffect, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useColorScheme } from 'calypso/lib/color-scheme/shared';
import { COLOR_SCHEME_STORAGE_KEY, DARK_SEEDS, LIGHT_SEEDS } from './theme-pre-paint';
import type { ReactNode } from 'react';

/**
 * Returns whether the page is being printed, updated synchronously before the print snapshot.
 */
function useIsPrinting() {
	const [ isPrinting, setIsPrinting ] = useState( false );

	useEffect( () => {
		const start = () => flushSync( () => setIsPrinting( true ) );
		const end = () => setIsPrinting( false );
		window.addEventListener( 'beforeprint', start );
		window.addEventListener( 'afterprint', end );
		return () => {
			window.removeEventListener( 'beforeprint', start );
			window.removeEventListener( 'afterprint', end );
		};
	}, [] );

	return isPrinting;
}

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
	const isPrint = useIsPrinting();
	const isDark =
		enabled &&
		! isPrint &&
		( colorScheme === 'dark' || ( colorScheme === 'system' && prefersDark ) );

	useEffect( () => {
		try {
			window.localStorage.setItem( COLOR_SCHEME_STORAGE_KEY, enabled ? colorScheme : 'light' );
		} catch {}
	}, [ enabled, colorScheme ] );

	useLayoutEffect( () => {
		delete document.documentElement.dataset.prePaintTheme;
	}, [] );

	return (
		<ThemeProvider isRoot color={ isDark ? DARK_SEEDS : LIGHT_SEEDS }>
			{ children }
		</ThemeProvider>
	);
}
