/**
 * Whether each site uses AI credits, as learned in this tab: a 404 from the balance
 * endpoint means no, and a balance from a turn means yes. It's kept in sessionStorage,
 * so the Agents Manager and Image Studio share it, and it survives wp-admin page loads
 * while the chat stays docked. Answers expire, so a site that joins AI credits is asked
 * again; without storage, it lasts for the page load.
 */
const STORAGE_KEY = 'agents-manager-site-credits';
const TTL_MS = 30 * 60 * 1000;

type KnownSites = Record< string, { usesAiCredits: boolean; at: number } >;

let memory: KnownSites = {};

function isFresh( entry: unknown, now: number ): entry is KnownSites[ string ] {
	if ( ! entry || typeof entry !== 'object' ) {
		return false;
	}
	const { usesAiCredits, at } = entry as Partial< KnownSites[ string ] >;
	return (
		typeof usesAiCredits === 'boolean' && typeof at === 'number' && at <= now && now - at < TTL_MS
	);
}

function readKnownSites(): KnownSites {
	try {
		const stored: unknown = JSON.parse( window.sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );
		return stored && typeof stored === 'object' ? ( stored as KnownSites ) : {};
	} catch {
		return memory;
	}
}

export function getKnownSiteCredits( siteId: number ): boolean | undefined {
	const entry = readKnownSites()[ siteId ];
	return isFresh( entry, Date.now() ) ? entry.usesAiCredits : undefined;
}

export function setKnownSiteCredits( siteId: number, usesAiCredits: boolean ): void {
	const now = Date.now();
	const sites: KnownSites = Object.fromEntries(
		Object.entries( readKnownSites() ).filter( ( [ , entry ] ) => isFresh( entry, now ) )
	);
	sites[ siteId ] = { usesAiCredits, at: now };
	memory = sites;
	try {
		window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( sites ) );
	} catch {
		// Without storage, the answer lasts for the page load.
	}
}

/** Forgets what was learned, as a new tab would. */
export function clearKnownSiteCredits(): void {
	memory = {};
	try {
		window.sessionStorage.removeItem( STORAGE_KEY );
	} catch {
		// Nothing stored to remove.
	}
}
