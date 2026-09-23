import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
	ColorSchemeContextProvider,
	DEFAULT_SCHEME,
	PREFERENCE_KEY,
	isColorScheme,
} from './shared';
import type { ColorScheme } from './shared';
import type { ReactNode } from 'react';

export function ColorSchemeProvider( {
	children,
	enabled = true,
	colorScheme: fixedColorScheme,
}: {
	children: ReactNode;
	enabled?: boolean;
	colorScheme?: ColorScheme;
} ) {
	const { data: savedColorScheme, isFetched } = useQuery( {
		...userPreferenceQuery( PREFERENCE_KEY ),
		enabled: enabled && ! fixedColorScheme,
	} );
	const { mutate: saveColorScheme, isPending } = useMutation(
		userPreferenceOptimisticMutation( PREFERENCE_KEY )
	);
	const colorScheme =
		fixedColorScheme ?? ( isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME );
	const isReady = fixedColorScheme !== undefined || savedColorScheme !== undefined || isFetched;

	const setColorScheme = useCallback(
		( scheme: ColorScheme, options?: { onSuccess?: () => void } ) => {
			if ( fixedColorScheme || ! isColorScheme( scheme ) || scheme === colorScheme || isPending ) {
				return;
			}

			saveColorScheme( scheme, {
				onSuccess: options?.onSuccess,
			} );
		},
		[ colorScheme, fixedColorScheme, isPending, saveColorScheme ]
	);

	return (
		<ColorSchemeContextProvider
			colorScheme={ colorScheme }
			enabled={ enabled }
			isReady={ isReady }
			setColorScheme={ setColorScheme }
			waitForReady
		>
			{ children }
		</ColorSchemeContextProvider>
	);
}
