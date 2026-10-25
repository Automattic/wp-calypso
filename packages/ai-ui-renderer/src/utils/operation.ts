/**
 * The operation an A2UI message holds: every message holds one, keyed by its name, on one surface.
 * The agent's messages aren't validated, so any entry may be malformed.
 * @param message An A2UI message.
 */
export function getInteractiveUiOperation(
	message: unknown
): { name: string; surfaceId: string } | undefined {
	if ( typeof message !== 'object' || message === null ) {
		return undefined;
	}

	const [ name, operation ] =
		Object.entries( message ).find( ( [ key ] ) => key !== 'version' ) ?? [];
	const surfaceId =
		typeof operation === 'object' && operation !== null && 'surfaceId' in operation
			? operation.surfaceId
			: undefined;

	return name && typeof surfaceId === 'string' ? { name, surfaceId } : undefined;
}
