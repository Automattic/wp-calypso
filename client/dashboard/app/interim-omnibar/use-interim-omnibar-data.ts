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

async function fetchAndApplyLocaleData( language: string ): Promise< null > {
	try {
		const response = await fetch(
			`https://widgets.wp.com/languages/calypso/${ language }-v1.1.json`
		);
		defaultI18n.resetLocaleData( await response.json() );
	} catch {
		// Fall back to English if loading fails.
	}
	return null;
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
 * hydration succeeds; after hydration commits, the hook switches to
 * query-driven data.
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

	// Load translations for the omnibar after hydration. The interim omnibar
	// hydrates independently from the main dashboard `Layout` (which provides
	// the `I18nProvider`), so without this it would render in English even for
	// non-English users. When the query resolves, React re-renders and the
	// Masterbar picks up the new locale via `@wordpress/i18n`'s `__()`.
	const language = getUserLanguage( user );
	useQuery( {
		queryKey: [ 'omnibar-locale', language ],
		queryFn: () => fetchAndApplyLocaleData( language ),
		enabled: hydrated && language !== 'en',
		staleTime: Infinity,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	} );

	const onToggleMenu = useCallback( () => events.mobileMenu.emit(), [ events ] );
	const onToggleNotifications = useCallback( () => events.notifications.emit(), [ events ] );

	if ( ! hydrated ) {
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
