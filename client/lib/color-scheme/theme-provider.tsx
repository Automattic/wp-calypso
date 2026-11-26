import { useMediaQuery } from '@wordpress/compose';
import { ThemeProvider } from '@wordpress/theme';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { DARK_SEEDS } from './seeds';
import { useColorScheme } from './shared';
import type { LIGHT_SEEDS } from './seeds';
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
export function ColorSchemeThemeProvider( {
	children,
	enabled,
	lightSeeds,
}: {
	children?: ReactNode;
	enabled: boolean;
	lightSeeds?: typeof LIGHT_SEEDS;
} ) {
	const { colorScheme } = useColorScheme();
	const prefersDark = useMediaQuery( '(prefers-color-scheme: dark)' );
	const isPrint = useIsPrinting();
	const isDark =
		enabled &&
		! isPrint &&
		( colorScheme === 'dark' || ( colorScheme === 'system' && prefersDark ) );

	return (
		<ThemeProvider isRoot color={ isDark ? DARK_SEEDS : lightSeeds }>
			{ children }
		</ThemeProvider>
	);
}
