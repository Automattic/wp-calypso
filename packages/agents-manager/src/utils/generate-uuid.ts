export function generateUUID(): string {
	// `randomUUID` needs a secure context; `getRandomValues` works on plain http too.
	if ( typeof globalThis.crypto.randomUUID === 'function' ) {
		return globalThis.crypto.randomUUID();
	}

	const randomValues = globalThis.crypto.getRandomValues( new Uint8Array( 32 ) );
	let randomIndex = 0;

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, ( c ) => {
		const r = randomValues[ randomIndex++ ] & 0x0f;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
}
