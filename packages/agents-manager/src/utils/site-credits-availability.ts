/**
 * Sites that answered the AI credits balance request with a 404 in this tab, so they
 * don't use AI credits. It's kept in sessionStorage, so the Agents Manager and Image
 * Studio share it, and it survives wp-admin page loads while the chat stays docked.
 * A mark expires after 30 minutes, and a balance from a turn removes it. Without
 * storage, nothing is remembered and every chat asks, as before.
 */
const STORAGE_KEY = 'agents-manager-sites-without-ai-credits';
const TTL_MS = 30 * 60 * 1000;

type Marks = Record< string, unknown >;

function isFresh( markedAt: unknown, now: number ): markedAt is number {
	return typeof markedAt === 'number' && markedAt <= now && now - markedAt < TTL_MS;
}

function readMarks(): Marks {
	try {
		const stored: unknown = JSON.parse( window.sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );
		return stored && typeof stored === 'object' ? ( stored as Marks ) : {};
	} catch {
		return {};
	}
}

function writeMarks( marks: Marks ): void {
	try {
		window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( marks ) );
	} catch {
		// A mark that can't be updated mustn't outlive the answer, so drop them all.
		try {
			window.sessionStorage.removeItem( STORAGE_KEY );
		} catch {
			// Without storage, nothing is remembered.
		}
	}
}

export function isSiteWithoutAiCredits( siteId: number ): boolean {
	return isFresh( readMarks()[ siteId ], Date.now() );
}

export function markSiteWithoutAiCredits( siteId: number ): void {
	const now = Date.now();
	const marks = Object.fromEntries(
		Object.entries( readMarks() ).filter( ( [ , markedAt ] ) => isFresh( markedAt, now ) )
	);
	writeMarks( { ...marks, [ siteId ]: now } );
}

export function forgetSiteWithoutAiCredits( siteId: number ): void {
	const marks = readMarks();
	if ( ! ( siteId in marks ) ) {
		return;
	}
	delete marks[ siteId ];
	writeMarks( marks );
}
