/**
 * Whether each site uses AI credits, as learned during this page load: a 404 from the
 * balance endpoint means no, and a balance from a turn means yes. It lives outside the
 * chat, so a reopened or new chat doesn't ask again for a site that already answered 404.
 */
const knownSites = new Map< number, boolean >();

export function getKnownSiteCredits( siteId: number ): boolean | undefined {
	return knownSites.get( siteId );
}

export function setKnownSiteCredits( siteId: number, usesAiCredits: boolean ): void {
	knownSites.set( siteId, usesAiCredits );
}

/** Forgets what was learned, as a page reload would. */
export function clearKnownSiteCredits(): void {
	knownSites.clear();
}
