export function generateUUID(): string {
	if ( typeof globalThis.crypto?.randomUUID === 'function' ) {
		return globalThis.crypto.randomUUID();
	}

	const randomValues =
		typeof globalThis.crypto?.getRandomValues === 'function'
			? globalThis.crypto.getRandomValues( new Uint8Array( 32 ) )
			: undefined;
	let randomIndex = 0;

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, ( c ) => {
		// Last-resort Math.random fallback is for local IDs, not authentication.
		const r = randomValues ? randomValues[ randomIndex++ ] & 0x0f : ( Math.random() * 16 ) | 0;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
}
