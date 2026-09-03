// packages/ui/src/utils/warning.ts
// `process.env.NODE_ENV` is statically replaced and DCE'd by bundlers in
// production. The `typeof process` guard avoids a ReferenceError in consumers
// whose bundler doesn't shim `process`.
declare const process: { env: { NODE_ENV?: string } };

const seen = new Set< string >();

/** Logs a one-time dev warning. No-op in production builds. */
export function warning( message: string ): void {
	if ( typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ) {
		return;
	}
	if ( seen.has( message ) ) {
		return;
	}
	seen.add( message );
	// eslint-disable-next-line no-console
	console.warn( message );
}
