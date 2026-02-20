import type { ZendeskConversation } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCallback = ( ...args: any[] ) => void;

export interface SmoochSDK {
	init( options: {
		integrationId: string;
		externalId?: string;
		jwt?: string;
		embedded?: boolean;
		soundNotificationEnabled?: boolean;
		delegate?: {
			onInvalidAuth?: () => string | Promise< string >;
		};
	} ): Promise< void >;
	destroy(): Promise< void >;
	render( element: HTMLElement ): void;
	on( event: string, callback: AnyCallback ): void;
	off( event: string, callback: AnyCallback ): void;
	sendMessage(
		message: { type: string; text: string; payload?: string; metadata?: Record< string, unknown > },
		conversationId: string
	): void;
	createConversation( options: Partial< ZendeskConversation > ): Promise< ZendeskConversation >;
	updateConversation(
		conversationId: string,
		options: Partial< ZendeskConversation >
	): Promise< ZendeskConversation >;
	loadConversation( conversationId: string ): Promise< unknown >;
	getConversationById( conversationId?: string ): Promise< ZendeskConversation >;
	getConversations(): ZendeskConversation[];
	markAllAsRead( conversationId?: string ): Promise< unknown >;
	startTyping( conversationId?: string ): void;
	stopTyping( conversationId?: string ): void;
}

// Extend Window to include the Smooch global set by the CDN script.
declare global {
	interface Window {
		Smooch: SmoochSDK;
	}
}

/**
 * Lazy proxy for the Smooch SDK loaded via CDN (`smooch.X.Y.Z.min.js`).
 *
 * Importing this module is safe before the CDN script has loaded — all property
 * accesses are forwarded to `window.Smooch` at call time, not at import time.
 *
 * Use this instead of referencing `window.Smooch` directly everywhere.
 */
const Smooch = new Proxy( {} as SmoochSDK, {
	get( _target, prop: string ) {
		return ( window.Smooch as unknown as Record< string, unknown > )?.[ prop ];
	},
} );

export default Smooch;
