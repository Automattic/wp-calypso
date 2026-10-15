import { normalizeAbilityName } from '../abilities/ability-name';
import type { ClientContextType } from '../extension-types';

export const EMBEDDED_PAGE_MESSAGE_SOURCE = 'agents-manager-embed';
export const EMBEDDED_PAGE_PROTOCOL_VERSION = 1;

export type EmbeddedPageRequestType = 'get-abilities' | 'execute-ability' | 'get-context';
export type EmbeddedPageResponseType = 'ready' | 'abilities' | 'ability-result' | 'context';

export interface EmbeddedPageMessage {
	source: typeof EMBEDDED_PAGE_MESSAGE_SOURCE;
	v: typeof EMBEDDED_PAGE_PROTOCOL_VERSION;
	type: EmbeddedPageRequestType | EmbeddedPageResponseType;
	id?: string;
	payload?: unknown;
}

export interface EmbeddedPageReadyPayload {
	environment: string;
	url: string;
}

export interface EmbeddedPageExecutePayload {
	name: string;
	args: unknown;
}

export interface SerializableAbility {
	name: string;
	label?: string;
	description?: string;
	category?: string;
	input_schema?: unknown;
	output_schema?: unknown;
	meta?: unknown;
}

const ALLOWED_PARENT_ORIGINS = new Set( [
	'https://wordpress.com',
	'https://my.wordpress.com',
	'http://my.localhost:3000',
	'http://calypso.localhost:3000',
] );

// These require shared-window UI or navigation coordination that belongs to P4.
const UNSUPPORTED_EMBEDDED_ABILITIES = new Set(
	[
		'big-sky/capture-canvas',
		'big-sky/editor-navigate',
		'big-sky/restore-checkpoint',
		'big-sky/stream-page-design',
		'wp-admin/navigate',
	].map( normalizeAbilityName )
);

function getAncestorOrigin(): string | undefined {
	const ancestorOrigins = window.location.ancestorOrigins;
	return ancestorOrigins?.length ? ancestorOrigins[ 0 ] : undefined;
}

function getReferrerOrigin(): string | undefined {
	try {
		return document.referrer ? new URL( document.referrer ).origin : undefined;
	} catch {
		return undefined;
	}
}

const embeddedParentOrigin =
	typeof window !== 'undefined' && window.parent !== window
		? ( getAncestorOrigin() ?? getReferrerOrigin() )
		: undefined;

const isEmbeddedPage =
	typeof window !== 'undefined' &&
	window.parent !== window &&
	new URLSearchParams( window.location.search ).get( 'am-embedded' ) === '1' &&
	( embeddedParentOrigin === undefined || ALLOWED_PARENT_ORIGINS.has( embeddedParentOrigin ) );

/**
 * Captures the trusted full-screen embedding decision once for this page load.
 * Browsers without `ancestorOrigins` still validate every incoming message origin.
 */
export function isEmbeddedInFullscreen(): boolean {
	return isEmbeddedPage;
}

export function isAllowedEmbeddedParentOrigin( origin: string ): boolean {
	return ALLOWED_PARENT_ORIGINS.has( origin );
}

export function isSupportedEmbeddedAbility( name: string ): boolean {
	return ! UNSUPPORTED_EMBEDDED_ABILITIES.has( normalizeAbilityName( name ) );
}

/** Omits checkpoint UI and page-design streaming context until P4 bridges them. */
export function getSupportedEmbeddedContext( context: ClientContextType ): ClientContextType {
	return Object.fromEntries(
		Object.entries( context ).filter(
			( [ key ] ) => key !== 'availableCheckpoints' && key !== 'currentPageContentMarkup'
		)
	) as ClientContextType;
}

export function getEmbeddedParentOrigin(): string | undefined {
	return embeddedParentOrigin;
}

export function createEmbeddedPageMessage(
	type: EmbeddedPageMessage[ 'type' ],
	payload?: unknown,
	id?: string
): EmbeddedPageMessage {
	return {
		source: EMBEDDED_PAGE_MESSAGE_SOURCE,
		v: EMBEDDED_PAGE_PROTOCOL_VERSION,
		type,
		...( id && { id } ),
		...( payload !== undefined && { payload } ),
	};
}

export function isEmbeddedPageMessage( value: unknown ): value is EmbeddedPageMessage {
	if ( typeof value !== 'object' || value === null ) {
		return false;
	}

	const message = value as Partial< EmbeddedPageMessage >;
	return (
		message.source === EMBEDDED_PAGE_MESSAGE_SOURCE &&
		message.v === EMBEDDED_PAGE_PROTOCOL_VERSION &&
		typeof message.type === 'string'
	);
}

export function isEmbeddedPageReadyPayload( value: unknown ): value is EmbeddedPageReadyPayload {
	if ( typeof value !== 'object' || value === null ) {
		return false;
	}

	const payload = value as Partial< EmbeddedPageReadyPayload >;
	return typeof payload.environment === 'string' && typeof payload.url === 'string';
}

export function isEmbeddedPageExecutePayload(
	value: unknown
): value is EmbeddedPageExecutePayload {
	if ( typeof value !== 'object' || value === null ) {
		return false;
	}

	return typeof ( value as Partial< EmbeddedPageExecutePayload > ).name === 'string';
}

export function isClientContextSnapshot( value: unknown ): value is ClientContextType {
	return typeof value === 'object' && value !== null;
}
