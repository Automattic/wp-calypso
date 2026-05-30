type SiteEditorActionValue = string | number | boolean | null;

const siteEditorActions: Record< string, SiteEditorActionValue > = {};

export function normalizeSiteId( siteId: unknown ): number | undefined {
	const numericSiteId = Number( siteId );
	return Number.isFinite( numericSiteId ) && numericSiteId > 0 ? numericSiteId : undefined;
}

export function getSelectedSiteIdFromGlobals(): number | undefined {
	const globalData = window as unknown as {
		JP_CONNECTION_INITIAL_STATE?: {
			userConnectionData?: {
				currentUser?: {
					blogId?: number | string;
				};
			};
		};
		Jetpack_Editor_Initial_State?: {
			wpcomBlogId?: number | string;
		};
		agentsManagerData?: {
			siteId?: number | string;
			site?: {
				ID?: number | string;
			};
		};
	};

	return normalizeSiteId(
		globalData.agentsManagerData?.site?.ID ??
			globalData.agentsManagerData?.siteId ??
			globalData.JP_CONNECTION_INITIAL_STATE?.userConnectionData?.currentUser?.blogId ??
			globalData.Jetpack_Editor_Initial_State?.wpcomBlogId
	);
}

export function isSiteEditorContext( environment?: string, currentRoute?: string ): boolean {
	const route = currentRoute || window.location.pathname || window.location.href;
	return (
		environment === 'site-editor' ||
		route.includes( 'site-editor.php' ) ||
		document.body?.classList.contains( 'site-editor-php' )
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
