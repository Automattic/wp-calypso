import { rawUserPreferencesQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
	ColorSchemeContextProvider,
	DEFAULT_SCHEME,
	PREFERENCE_KEY,
	isColorScheme,
} from './shared';
import type { ColorScheme, ColorSchemeContextType } from './shared';
import type { ReactNode } from 'react';

export function ColorSchemeProvider( {
	children,
	enabled = true,
	defaultColorScheme = DEFAULT_SCHEME,
}: {
	children: ReactNode;
	enabled?: boolean;
	defaultColorScheme?: ColorScheme;
} ) {
	const { data: savedColorScheme, isFetched } = useQuery( {
		...rawUserPreferencesQuery(),
		select: ( preferences ) => preferences[ PREFERENCE_KEY ],
		enabled,
	} );
	const { mutate: saveColorScheme, isPending } = useMutation(
		userPreferenceOptimisticMutation( PREFERENCE_KEY )
	);
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : defaultColorScheme;
	const isReady = savedColorScheme !== undefined || isFetched;

	const setColorScheme = useCallback< ColorSchemeContextType[ 'setColorScheme' ] >(
		( scheme, options ) => {
			if ( ! isColorScheme( scheme ) || scheme === colorScheme || isPending ) {
				return;
			}

			saveColorScheme( scheme, {
				onSuccess: options?.onSuccess,
				onError: options?.onError,
			} );
		},
		[ colorScheme, isPending, saveColorScheme ]
	);

	return (
		<ColorSchemeContextProvider
			colorScheme={ colorScheme }
			enabled={ enabled }
			isReady={ isReady }
			setColorScheme={ setColorScheme }
			isSaving={ isPending }
			waitForReady
		>
			{ children }
		</ColorSchemeContextProvider>
	);
}
