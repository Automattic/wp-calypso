import { useEffect, useRef } from 'react';
import { DEFAULT_SCHEME, PREFERENCE_KEY, isColorScheme } from 'calypso/dashboard/app/color-scheme';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import type { AppState } from 'calypso/types';
import type { ReactNode } from 'react';

import './dark-mode.scss';

const READER_DARK_MODE_BODY_CLASS = 'is-reader-dark-mode';

export default function ReaderColorScheme( { children }: { children?: ReactNode } ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const savedColorScheme = useSelector( ( state: AppState ) =>
		getPreference( state, PREFERENCE_KEY )
	);
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME;
	const previousTheme = useRef< string | undefined >( undefined );
	const shouldApplyColorScheme = isLoggedIn && hasPreferences;

	useEffect( () => {
		if ( ! shouldApplyColorScheme ) {
			return;
		}

		previousTheme.current = document.documentElement.dataset.theme;
		document.body.classList.add( READER_DARK_MODE_BODY_CLASS );

		return () => {
			document.body.classList.remove( READER_DARK_MODE_BODY_CLASS );

			if ( previousTheme.current === undefined ) {
				delete document.documentElement.dataset.theme;
			} else {
				document.documentElement.dataset.theme = previousTheme.current;
			}
			previousTheme.current = undefined;
		};
	}, [ shouldApplyColorScheme ] );

	useEffect( () => {
		if ( ! shouldApplyColorScheme ) {
			return;
		}

		document.documentElement.dataset.theme = colorScheme;
	}, [ colorScheme, shouldApplyColorScheme ] );

	return <>{ children }</>;
}
