import { useCallback, useLayoutEffect, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { clearPrePaintTheme, readColorSchemeHint } from './pre-paint';
import {
	ColorSchemeContextProvider,
	DEFAULT_SCHEME,
	PREFERENCE_KEY,
	isColorScheme,
} from './shared';
import { ColorSchemeThemeProvider } from './theme-provider';
import type { ColorSchemeContextType } from './shared';
import type { ReactNode } from 'react';

export function ClassicColorSchemeProvider( {
	children,
	enabled = true,
}: {
	children: ReactNode;
	enabled?: boolean;
} ) {
	const isReady = useSelector( hasReceivedRemotePreferences );
	const savedColorScheme = useSelector( ( state ) => getPreference( state, PREFERENCE_KEY ) );
	const [ hint ] = useState( readColorSchemeHint );
	const hintedScheme = ! isReady && isColorScheme( hint ) ? hint : null;
	const hasHint = hintedScheme !== null;
	const savedScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME;
	const colorScheme = hintedScheme ?? savedScheme;

	const setColorScheme = useCallback< ColorSchemeContextType[ 'setColorScheme' ] >(
		() => undefined,
		[]
	);

	useLayoutEffect( () => {
		if ( ! enabled ) {
			clearPrePaintTheme();
		}
	}, [ enabled ] );

	return (
		<ColorSchemeContextProvider
			colorScheme={ colorScheme }
			enabled={ enabled }
			isReady={ isReady || hasHint }
			restoreOnUnmount
			setColorScheme={ setColorScheme }
			waitForReady={ false }
		>
			{ enabled && ( isReady || hasHint ) && <ColorSchemeThemeProvider enabled /> }
			{ children }
		</ColorSchemeContextProvider>
	);
}
