/**
 * WordPress Design System (WPDS) theming bridge for Calypso.
 *
 * This module is the heart of the migration away from Calypso's bespoke
 * dark-mode engine (the `color-scheme-dark-theme-*` SCSS mixin library and the
 * `data-theme` attribute) toward the official `@wordpress/theme` package.
 *
 * `@wordpress/theme` does not expose its `ThemeProvider` publicly yet — it ships
 * behind the package's `privateApis` lock. We deliberately opt in to the private
 * API here. This is explicitly sanctioned for the migration: the WPDS team has
 * confirmed the `ThemeProvider` shape is the intended public surface, and gating
 * the unlock to this single module keeps the blast radius contained. If/when the
 * provider graduates to a public export, this file becomes the only thing that
 * needs to change.
 */
// eslint-disable-next-line no-restricted-imports
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { privateApis } from '@wordpress/theme';
import { useEffect, useState } from 'react';
import type { ColorScheme } from './shared';
import type { ComponentType, ReactNode } from 'react';

// `@wordpress/private-apis` only lets allow-listed core modules unlock private
// exports. We borrow the `@wordpress/ui` slot (already on the allow-list and the
// companion package we intend to consume) so Calypso can read the lock. The
// consent string is fixed by `@wordpress/private-apis` and must match verbatim.
const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/ui'
);

type ThemeProviderColor = { primary?: string; bg?: string };

interface ThemeProviderProps {
	children?: ReactNode;
	color?: ThemeProviderColor;
	cursor?: { control?: 'default' | 'pointer' };
	density?: undefined | 'default' | 'compact' | 'comfortable';
	isRoot?: boolean;
}

const { ThemeProvider } = unlock( privateApis ) as {
	ThemeProvider: ComponentType< ThemeProviderProps >;
};

/**
 * Background seed colors handed to the WPDS `ThemeProvider`.
 *
 * The provider derives the full token ramp — and crucially whether the theme is
 * light or dark — from the background seed. These two values replace the entire
 * hand-rolled `color-mix()` palette generator that used to live in
 * `dark-theme.scss`.
 *
 * `LIGHT_BG` matches the WPDS default (`#f8f8f8`); `DARK_BG` matches the
 * DS-derived dashboard canvas from PR #111689 (`#14161a`), a cool-tinted dark
 * rather than a flat neutral gray.
 */
export const SEED_BACKGROUND: Record< 'light' | 'dark', string > = {
	light: '#f8f8f8',
	dark: '#14161a',
};

/**
 * Brand seed handed to the provider as `primary`. The provider derives the
 * per-mode accent from it, so dark regenerates the DS accent (~`#93aef8` in
 * #111689) from the same WordPress brand blue used in light.
 */
const SEED_PRIMARY = '#3858e9';

/**
 * Resolves a stored `ColorScheme` ('light' | 'dark' | 'system') into a concrete
 * 'light' | 'dark' value, tracking the OS preference live when set to 'system'.
 */
export function useResolvedColorScheme( colorScheme: ColorScheme ): 'light' | 'dark' {
	const getSystemPrefersDark = () =>
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia( '(prefers-color-scheme: dark)' ).matches;

	const [ systemPrefersDark, setSystemPrefersDark ] = useState( getSystemPrefersDark );

	useEffect( () => {
		if ( typeof window === 'undefined' || typeof window.matchMedia !== 'function' ) {
			return;
		}

		const query = window.matchMedia( '(prefers-color-scheme: dark)' );
		const handleChange = ( event: MediaQueryListEvent ) => setSystemPrefersDark( event.matches );

		query.addEventListener( 'change', handleChange );
		return () => query.removeEventListener( 'change', handleChange );
	}, [] );

	if ( colorScheme === 'system' ) {
		return systemPrefersDark ? 'dark' : 'light';
	}

	return colorScheme === 'dark' ? 'dark' : 'light';
}

/**
 * Wraps the app in the WPDS `ThemeProvider`, seeding it with the background
 * color for the resolved scheme. The provider regenerates the `--wpds-*` design
 * tokens (and the legacy `--wp-components-*`/`--wp-admin-theme-color` aliases)
 * for the active mode, so every component that consumes WPDS tokens or
 * `@wordpress/ui` follows the chosen color scheme automatically — no `data-theme`
 * selectors and no bespoke palette mixins required.
 *
 * `isRoot` makes the provider also apply its tokens to the document root, so
 * portaled overlays and the `html`/`body` background inherit the correct theme.
 */
export function WPDSThemeProvider( {
	resolvedScheme,
	children,
}: {
	resolvedScheme: 'light' | 'dark';
	children: ReactNode;
} ) {
	return (
		<ThemeProvider
			isRoot
			color={ { primary: SEED_PRIMARY, bg: SEED_BACKGROUND[ resolvedScheme ] } }
			density="compact"
		>
			{ children }
		</ThemeProvider>
	);
}
