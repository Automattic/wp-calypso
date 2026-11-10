import { HTML_PREVIEW_RUNTIME } from './html-preview-runtime';

export type PreviewFrameStatus =
	| { v: 1; channel: string; type: 'ready' }
	| { v: 1; channel: string; type: 'status'; homeReady: boolean }
	| { v: 1; channel: string; type: 'tour'; title: string | null }
	| { v: 1; channel: string; type: 'evicted' | 'rejected'; ids: string[] };

function randomKey(): string {
	return Array.from( window.crypto.getRandomValues( new Uint8Array( 24 ) ), ( byte ) =>
		byte.toString( 16 ).padStart( 2, '0' )
	).join( '' );
}

function escapeAttribute( value: string ): string {
	return value.replace( /[&"<>]/g, ( character ) => {
		return { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[ character ] ?? '';
	} );
}

/** The shell is immutable. Only this program can execute in the opaque frame. */
export function createPreviewFrame() {
	const nonce = randomKey();
	const channel = randomKey();
	const policy = [
		"default-src 'none'",
		`script-src 'nonce-${ nonce }'`,
		"script-src-attr 'none'",
		"style-src 'unsafe-inline'",
		'img-src blob:',
		'font-src blob:',
		"connect-src 'none'",
		"frame-src 'none'",
		"worker-src 'none'",
		"object-src 'none'",
		"form-action 'none'",
		"base-uri 'none'",
	].join( '; ' );
	return {
		channel,
		srcDoc: `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${ escapeAttribute( policy ) }"><meta name="referrer" content="no-referrer"></head><body><script nonce="${ nonce }" data-channel="${ channel }" data-parent-origin="${ escapeAttribute( window.location.origin ) }">${ HTML_PREVIEW_RUNTIME }</script></body></html>`,
	};
}

export function isPreviewFrameStatus(
	value: unknown,
	channel: string
): value is PreviewFrameStatus {
	if ( ! value || typeof value !== 'object' ) {
		return false;
	}
	const message = value as Record< string, unknown >;
	return (
		message.v === 1 &&
		message.channel === channel &&
		( message.type === 'ready' ||
			( message.type === 'status' && typeof message.homeReady === 'boolean' ) ||
			( message.type === 'tour' &&
				( message.title === null ||
					( typeof message.title === 'string' && message.title.length <= 100 ) ) ) ||
			( ( message.type === 'evicted' || message.type === 'rejected' ) &&
				Array.isArray( message.ids ) &&
				message.ids.length <= 96 &&
				message.ids.every(
					( id: unknown ) => typeof id === 'string' && /^[a-f0-9]{64}$/.test( id )
				) ) )
	);
}
