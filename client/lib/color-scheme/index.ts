export type ColorScheme = 'light' | 'dark' | 'system';

export const DEFAULT_COLOR_SCHEME: ColorScheme = 'light';
export const COLOR_SCHEME_STORAGE_KEY = 'wpcom_dashboard_color_scheme';

export function isColorScheme( value: unknown ): value is ColorScheme {
	return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredColorScheme(): ColorScheme {
	if ( typeof window === 'undefined' ) {
		return DEFAULT_COLOR_SCHEME;
	}

	try {
		const stored = window.localStorage.getItem( COLOR_SCHEME_STORAGE_KEY );
		if ( isColorScheme( stored ) ) {
			return stored;
		}
	} catch {
		// Access to localStorage can throw in privacy modes; fall through.
	}

	return DEFAULT_COLOR_SCHEME;
}

export function saveStoredColorScheme( scheme: ColorScheme ) {
	if ( typeof window === 'undefined' ) {
		return;
	}

	try {
		window.localStorage.setItem( COLOR_SCHEME_STORAGE_KEY, scheme );
	} catch {
		// Ignore storage failures; the in-memory state can still update.
	}
}

export function applyColorScheme( scheme: ColorScheme ) {
	if ( typeof document === 'undefined' ) {
		return;
	}

	document.documentElement.dataset.theme = scheme;
}

export function updateColorSchemePreference( scheme: ColorScheme ) {
	applyColorScheme( scheme );
	saveStoredColorScheme( scheme );
}
