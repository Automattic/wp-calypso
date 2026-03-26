export type ScreenId = 'root' | 'site' | 'domain' | 'me';

export interface SidebarState {
	screen: ScreenId;
	param?: string;
}

/**
 * Derives the active sidebar screen and its parameter from the current route.
 *
 * When `hasError` is true the sidebar falls back to the root screen so the
 * user can navigate away from the broken route.
 */
export function getSidebarState( pathname: string, hasError: boolean ): SidebarState {
	const param = pathname.split( '/' )[ 2 ] || undefined;

	if ( pathname.startsWith( '/sites/' ) && param && ! hasError ) {
		return { screen: 'site', param };
	}
	if ( pathname.startsWith( '/domains/' ) && param && ! hasError ) {
		return { screen: 'domain', param };
	}
	if ( pathname.startsWith( '/me' ) && ! hasError ) {
		return { screen: 'me' };
	}
	return { screen: 'root' };
}
