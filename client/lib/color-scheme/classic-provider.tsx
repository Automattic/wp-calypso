import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import {
	ColorSchemeContextProvider,
	DEFAULT_SCHEME,
	PREFERENCE_KEY,
	isColorScheme,
} from './shared';
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
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME;

	const setColorScheme = useCallback< ColorSchemeContextType[ 'setColorScheme' ] >(
		() => undefined,
		[]
	);

	return (
		<ColorSchemeContextProvider
			colorScheme={ colorScheme }
			enabled={ enabled }
			isReady={ isReady }
			restoreOnUnmount
			setColorScheme={ setColorScheme }
			waitForReady={ false }
		>
			{ children }
		</ColorSchemeContextProvider>
	);
}
