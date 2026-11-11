/**
 * Thrown when a `playground` ID from the URL cannot be booted from this browser's
 * OPFS storage. Playground reports this in different ways depending on its version
 * (e.g. "WordPress installation has failed." or "Error connecting to the SQLite
 * database."), so callers should branch on this class rather than on the message.
 */
export class PlaygroundNotFoundError extends Error {
	constructor( playgroundId: string, cause: unknown ) {
		const reason = cause instanceof Error ? cause.message : String( cause );
		super( `Playground ${ playgroundId } could not be restored from this browser: ${ reason }` );
		this.name = 'PlaygroundNotFoundError';
	}
}
