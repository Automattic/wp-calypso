import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DEFAULT_SCHEME, PREFERENCE_KEY, isColorScheme } from 'calypso/dashboard/app/color-scheme';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

export default function ThemesColorSchemeProvider( { children } ) {
	const isReady = useSelector( hasReceivedRemotePreferences );
	const savedColorScheme = useSelector( ( state ) => getPreference( state, PREFERENCE_KEY ) );
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME;

	useEffect( () => {
		if ( ! isReady ) {
			return;
		}
		const previousTheme = document.documentElement.dataset.theme;
		document.documentElement.dataset.theme = colorScheme;

		return () => {
			if ( previousTheme === undefined ) {
				delete document.documentElement.dataset.theme;
				return;
			}
			document.documentElement.dataset.theme = previousTheme;
		};
	}, [ colorScheme, isReady ] );

	return children;
}

export function withThemesColorScheme( children, { isSiteRoute, isLoggedIn } ) {
	if ( isSiteRoute || ! isLoggedIn ) {
		return children;
	}
	return (
		<ThemesColorSchemeProvider>
			<BodySectionCssClass bodyClass={ [ 'is-themes-dark-mode' ] } />
			{ children }
		</ThemesColorSchemeProvider>
	);
}
