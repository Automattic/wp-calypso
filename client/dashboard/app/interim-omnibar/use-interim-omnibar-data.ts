import { siteByIdQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { defaultI18n } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import type { OmnibarEvents } from './click-handlers';
import type { Site, User } from '@automattic/api-core';

function getUserLanguage( user: User | null | undefined ): string {
	if ( ! user ) {
		return 'en';
	}
	// Prefer the bootstrap-provided locale fields (`localeVariant`/`localeSlug`)
	// because they reflect the locale Calypso actually uses; fall back to the
	// REST fields when bootstrap data isn't available.
	return user.localeVariant || user.localeSlug || user.locale_variant || user.language || 'en';
}

interface UseInterimOmnibarDataOptions {
	initialUser: User | null;
	events: OmnibarEvents;
}

export interface InterimOmnibarData {
	user: User | null;
	site: Site | null;
	currentRoute: string;
	onToggleMenu?: () => void;
	onToggleNotifications?: () => void;
}

/**
 * Provides the props for `InterimOmnibar`. The first render mirrors the SSR
 * output exactly (`user = initialUser`, `site = null`, no callbacks) so
 * hydration succeeds. After hydration commits, the hook switches to
 * query-driven data — but only once the user's locale data has also been
 * loaded, so the user never sees real omnibar content in the wrong language.
 */
export function useInterimOmnibarData( {
	initialUser,
	events,
}: UseInterimOmnibarDataOptions ): InterimOmnibarData {
	const [ hydrated, setHydrated ] = useState( false );
	useEffect( () => {
		setHydrated( true );
	}, [] );

	const { data: user } = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: initializeCurrentUser,
		initialData: initialUser ?? undefined,
		enabled: hydrated,
	} );

	const { data: recentSites } = useQuery( {
		...userPreferenceQuery( 'recentSites' ),
		enabled: hydrated,
	} );

	const siteId = recentSites?.[ 0 ] || user?.primary_blog;

	const { data: site = null } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId,
	} );

	// Load the user's locale data into the global `defaultI18n` instance and
	// gate the full render on it. The interim omnibar hydrates independently
	// from the main dashboard `Layout` (which provides the `I18nProvider`), so
	// without this it would render in English even for non-English users.
	//
	// `localeVersion` bumps every time a locale has been applied (or skipped
	// because it's English, or abandoned after a fetch error). The full render
	// is gated on `localeVersion > 0` so bootstrapped non-English users see the
	// placeholder until their language is ready — no flash of English content.
	const initialLanguage = getUserLanguage( initialUser );
	const [ localeVersion, setLocaleVersion ] = useState( initialLanguage === 'en' ? 1 : 0 );
	const currentLanguage = getUserLanguage( user ?? initialUser );

	useEffect( () => {
		if ( ! hydrated ) {
			return;
		}
		if ( currentLanguage === 'en' ) {
			setLocaleVersion( ( v ) => ( v === 0 ? 1 : v ) );
			return;
		}
		let cancelled = false;
		fetch( `https://widgets.wp.com/languages/calypso/${ currentLanguage }-v1.1.json` )
			.then( ( response ) => response.json() )
			.then( ( data ) => {
				if ( cancelled ) {
					return;
				}
				defaultI18n.resetLocaleData( data );
				setLocaleVersion( ( v ) => v + 1 );
			} )
			.catch( () => {
				if ( cancelled ) {
					return;
				}
				// Fall back to whatever `defaultI18n` currently has (English by
				// default) so the omnibar doesn't stay blocked forever.
				setLocaleVersion( ( v ) => ( v === 0 ? 1 : v ) );
			} );
		return () => {
			cancelled = true;
		};
	}, [ hydrated, currentLanguage ] );

	const onToggleMenu = useCallback( () => events.mobileMenu.emit(), [ events ] );
	const onToggleNotifications = useCallback( () => events.notifications.emit(), [ events ] );

	if ( ! hydrated || localeVersion === 0 ) {
		return {
			user: initialUser,
			site: null,
			currentRoute: window.location.pathname,
		};
	}

	return {
		user: user ?? null,
		site,
		currentRoute: window.location.pathname,
		onToggleMenu,
		onToggleNotifications,
	};
}
