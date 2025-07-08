// Simple browser-compatible logger
const logger = ( message: string, ...args: any[] ) => {
	if (isDebugEnabled() ) {
		// eslint-disable-next-line no-console
		console.log( `[agenttic-client] ${ message }`, ...args );
	}
};

// Helper to check if debugging is enabled (simplified)
export function isDebugEnabled(): boolean {
	return (
		typeof globalThis !== 'undefined' &&
		'window' in globalThis &&
		( globalThis as any ).window?.DEBUG === 'agenttic-client'
	);
}

// Helper to enable debugging
export function enableDebug(): void {
	if ( typeof globalThis !== 'undefined' && 'window' in globalThis ) {
		( ( globalThis as any ).window as any ).DEBUG = 'agenttic-client';
	}
}

// Helper to format objects for logging
export function formatObject( obj: any ): string {
	return JSON.stringify( obj, null, 2 );
}

// Simple logging function
export function log( message: string, ...args: any[] ): void {
	// eslint-disable-next-line no-console
	console.log( `[agenttic-client] ${ message }`, ...args );
}

// Export the main logger
export { logger };
