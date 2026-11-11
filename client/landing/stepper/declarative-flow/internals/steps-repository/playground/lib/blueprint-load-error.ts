/**
 * Thrown when the blueprint referenced by the `blueprint` / `blueprint-url` query
 * parameters cannot be fetched or parsed. Nothing has been persisted to OPFS at this
 * point, so callers must not treat the attempted playground ID as an existing site.
 */
export class BlueprintLoadError extends Error {
	public readonly url: string;

	constructor( url: string, cause: unknown ) {
		const reason = cause instanceof Error ? cause.message : String( cause );
		super( `Failed to resolve blueprint: ${ url }: ${ reason }`, { cause } );
		this.name = 'BlueprintLoadError';
		this.url = url;
	}
}
