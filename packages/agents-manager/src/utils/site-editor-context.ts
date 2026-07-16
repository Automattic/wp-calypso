type SiteEditorActionValue = string | number | boolean | null;

const siteEditorActions: Record< string, SiteEditorActionValue > = {};

export function isSiteEditorContext( environment?: string, currentRoute?: string ): boolean {
	const route = currentRoute || window.location.pathname || window.location.href;
	return (
		environment === 'site-editor' ||
		route.includes( 'site-editor.php' ) ||
		document.body?.classList.contains( 'site-editor-php' )
	);
}

/**
 * True on the Site Editor navigation view (`site-editor.php` without
 * `?canvas=edit`) — the screen with the left nav menu, where the editor toolbar
 * is hidden. False in the editing canvas and on all other pages.
 */
export function isSiteEditorNavigationView(): boolean {
	return (
		isSiteEditorContext() &&
		new URLSearchParams( window.location.search ).get( 'canvas' ) !== 'edit'
	);
}

export function getClientConstructorArguments(
	environment?: string,
	currentRoute?: string
): Record< string, string > {
	if ( isSiteEditorContext( environment, currentRoute ) ) {
		return { client: 'site-editor' };
	}

	return {};
}

export function setSiteEditorAction( name: string, value: SiteEditorActionValue ): void {
	if ( typeof name !== 'string' || ! name.trim() ) {
		return;
	}

	siteEditorActions[ name ] = value;
}

export function getSiteEditorActions(): Record< string, SiteEditorActionValue > {
	return { ...siteEditorActions };
}

export function clearSiteEditorActions(): void {
	Object.keys( siteEditorActions ).forEach( ( key ) => {
		delete siteEditorActions[ key ];
	} );
}
