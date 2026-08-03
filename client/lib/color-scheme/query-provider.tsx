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
}: {
	children: ReactNode;
	enabled?: boolean;
} ) {
	const { data: savedColorScheme, isError } = useQuery( {
		...userPreferenceQuery( PREFERENCE_KEY ),
		enabled,
	} );
	const { mutate: saveColorScheme, isPending } = useMutation(
		userPreferenceOptimisticMutation( PREFERENCE_KEY )
	);
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME;
	const isReady = savedColorScheme !== undefined || isError;

	const setColorScheme = useCallback(
		( scheme: ColorScheme, options?: { onSuccess?: () => void } ) => {
			if ( ! isColorScheme( scheme ) || scheme === colorScheme || isPending ) {
				return;
			}

			saveColorScheme( scheme, {
				onSuccess: options?.onSuccess,
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
			waitForReady
		>
			{ children }
		</ColorSchemeContextProvider>
	);
}
