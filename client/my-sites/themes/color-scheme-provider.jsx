import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getPreference } from 'calypso/state/preferences/selectors';

const PREFERENCE_KEY = 'hosting-dashboard-color-scheme';
const DEFAULT_COLOR_SCHEME = 'light';

function isColorScheme( value ) {
	return value === 'light' || value === 'dark' || value === 'system';
}

export default function ThemesColorSchemeProvider( { children } ) {
	const savedColorScheme = useSelector( ( state ) => getPreference( state, PREFERENCE_KEY ) );
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_COLOR_SCHEME;

	useEffect( () => {
		document.documentElement.dataset.theme = colorScheme;
	}, [ colorScheme ] );

	return children;
}
