/**
 * This is used to swap out the server logger in non SSR contexts.
 */
export function getLogger(): unknown {
	throw new Error( 'This should never be called.' );
}
