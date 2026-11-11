/**
 * PROTOTYPE ONLY (untangling IA). A light registry so SitePreview can show a
 * static screenshot for mock sites without importing mock-sites.ts: SitePreview
 * is reachable from the server-rendered omnibar, and pulling the mock data
 * into that graph breaks the server bundle (circular import, every page 500s).
 */
type Resolver = ( url: string ) => string | undefined;

let resolver: Resolver | undefined;

export function setPrototypePreviewImageResolver( next: Resolver ) {
	resolver = next;
}

export function getPrototypePreviewImage( url: string ): string | undefined {
	return resolver?.( url );
}
