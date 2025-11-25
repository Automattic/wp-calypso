import { select } from '@wordpress/data';

const CORE_STORE = 'core';
const EDITOR_STORE = 'core/editor';
const NEXT_ADMIN_STORE = 'next-admin';
const IMAGE_STUDIO_STORE = 'image-studio';

/**
 * Agent environments
 * - 'wp-admin': Traditional WordPress admin interface
 * - 'ciab-admin': CIAB (Next) Admin interface
 */
export type AgentEnvironment = 'wp-admin' | 'ciab-admin';

interface PostTypeInfo {
	slug: string;
	label: string;
	restBase: string;
	description?: string;
	viewable?: boolean;
}

interface ProductTypeInfo {
	slug: string;
	label: string;
	description?: string;
	icon?: string;
}

interface ExpandedRoute {
	path: string;
	action: 'create' | 'edit' | 'list' | 'view';
	entityType: string;
	description?: string;
}

interface RelatedRoutes {
	create?: string;
	edit?: string;
	list?: string;
}

interface EnrichedMenuItem {
	id: string;
	to: string;
	label: string;
	parent: string | null;
	relatedRoutes?: RelatedRoutes;
}

/**
 * Entity context entry for WP entities like products, posts, etc.
 */
export interface EntityContextEntry {
	id: string;
	type: 'entity';
	entityType: string;
	entityId: string;
	getData?: () => any;
	data?: any;
}

/**
 * Sitemap context entry containing navigation and entity type metadata.
 */
export interface SitemapContextEntry {
	id: 'sitemap';
	type: 'sitemap';
	getData?: () => {
		menuItems: EnrichedMenuItem[];
		postTypes: PostTypeInfo[];
		productTypes?: ProductTypeInfo[];
		expandedRoutes: ExpandedRoute[];
	};
	data?: {
		menuItems: EnrichedMenuItem[];
		postTypes: PostTypeInfo[];
		productTypes?: ProductTypeInfo[];
		expandedRoutes: ExpandedRoute[];
	};
}

/**
 * Context entry - discriminated union for different context types.
 */
export type ContextEntry = EntityContextEntry | SitemapContextEntry;

/**
 * Client context type for wp-orchestrator agent
 */
export interface ClientContextType {
	url: string;
	pathname: string;
	search: string;
	environment: AgentEnvironment;
	contextEntries?: ContextEntry[];
	// Allow additional properties for compatibility with Agenttic ClientContext
	[ key: string ]: any;
}

/**
 * Detect the current admin environment
 * Returns 'image-studio' if the Image Studio modal is open
 * Returns 'ciab-admin' if the user is in the CIAB Admin interface (Next Admin plugin is installed, active, and user is on /new route)
 * Returns 'wp-admin' otherwise
 *
 * Supports both pretty permalinks (/wp-admin/new/...) and plain permalinks (/wp-admin/admin.php?page=next-admin&...)
 * @returns The environment identifier
 */
function detectEnvironment(): AgentEnvironment {
	try {
		const nextAdminStore = select( NEXT_ADMIN_STORE );
		const pathname = window.location.pathname;
		const search = window.location.search;

		// Check if Next Admin store exists (plugin is installed and active)
		if ( ! nextAdminStore ) {
			return 'wp-admin';
		}

		// Case 1: Pretty permalinks - check if pathname includes /new
		// Example: /wp-admin/new/woocommerce/products
		if ( pathname.includes( '/new' ) ) {
			return 'ciab-admin';
		}

		// Case 2: Plain permalinks - check if query string contains page=next-admin
		// Example: /wp-admin/admin.php?page=next-admin&p=%2Fwoocommerce%2Fproducts
		const urlParams = new URLSearchParams( search );
		if ( urlParams.get( 'page' ) === 'next-admin' ) {
			return 'ciab-admin';
		}
	} catch ( error ) {
		// If the store doesn't exist or there's an error, fall back to wp-admin
	}

	return 'wp-admin';
}

/**
 * Resolve getData closures to fetch current context data.
 * This ensures we always send fresh data to wpcom without storing duplicates.
 * @param {ContextEntry[]} entries - Context entries with getData closures to resolve
 * @returns {ContextEntry[]} Resolved context entries with data populated
 */
function resolveContextEntries( entries: ContextEntry[] ): ContextEntry[] {
	return entries.map( ( entry ) => {
		if ( ! entry.getData ) {
			return entry;
		}

		try {
			return {
				...entry,
				data: entry.getData(),
				getData: undefined,
			};
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( `[Agents Manager] Failed to resolve context entry ${ entry.id }:`, error );
			return entry;
		}
	} );
}

/**
 * Get context entries from ciab-admin store and resolve them.
 * Fetches entries from next-admin store and calls getData closures to get current data.
 * @param {any} nextAdminStore - The next-admin WordPress data store
 * @returns {ContextEntry[]} Resolved context entries with fresh entity data
 */
function getCiabAdminContext( nextAdminStore: any ): ContextEntry[] {
	const contextEntries = nextAdminStore?.getContextEntries?.() || [];
	if ( contextEntries.length === 0 ) {
		return [];
	}
	return resolveContextEntries( contextEntries );
}

/**
 * Detect and extract post entity when on post editor page
 * @returns Post entity context or null
 */
function detectPostEntity(): EntityContextEntry | null {
	try {
		const pathname = window.location.pathname; // '/wp-admin/post.php'
		const isPostEditor = pathname.match( /\/wp-admin\/post\.php/ );

		if ( ! isPostEditor ) {
			return null;
		}

		const editorStore = select( EDITOR_STORE ) as any;

		const postId = editorStore.getCurrentPostId();

		if ( ! postId ) {
			return null;
		}

		return {
			id: 'post',
			type: 'entity',
			entityType: 'post',
			entityId: postId.toString(),
		};
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[Agents Manager] Error detecting post entity:', error );
		return null;
	}
}
/**
 * Detect and extract image entity when in Image Studio
 * @returns Image entity context or null
 */
function detectImageEntity() {
	try {
		// Get image data from the dedicated image-studio store
		const imageStudioSelect = select( IMAGE_STUDIO_STORE ) as any;

		if ( ! imageStudioSelect ) {
			return null;
		}

		const attachmentId = imageStudioSelect.getImageStudioAttachmentId?.();

		// Priority: locked > current > original
		// - lockedContextUrl: Frozen during user message execution (prevents regeneration loop)
		// - currentImageUrl: Last AI-edited image (for subsequent edits)
		// - originalImageUrl: Initial image when modal opened
		const originalImageUrl = imageStudioSelect.getImageStudioOriginalImageUrl?.();
		const currentImageUrl = imageStudioSelect.getImageStudioCurrentImageUrl?.();
		const lockedContextUrl = imageStudioSelect.getImageStudioLockedContextUrl?.();
		const isOpen = imageStudioSelect.getIsImageStudioOpen?.() || false;

		// Try to get the attachment entity from core store
		const coreDataStore = select( CORE_STORE ) as any;
		const attachment = attachmentId
			? coreDataStore.getEntityRecord?.( 'postType', 'attachment', attachmentId )
			: null;

		if ( ! attachment ) {
			return {
				imageStudio: {
					isOpen,
					url: lockedContextUrl || currentImageUrl || originalImageUrl || null,
					metadata: {},
				},
			};
		}

		const contextUrl =
			lockedContextUrl || currentImageUrl || originalImageUrl || attachment.source_url;

		return {
			imageStudio: {
				isOpen,
				id: attachmentId,
				// Locked URL during execution, otherwise latest edited version
				url: contextUrl,
				metadata: {
					id: attachment.id,
					title: attachment.title?.rendered || attachment.title,
					alt: attachment.alt_text,
					url: contextUrl,
					width: attachment.media_details?.width,
					height: attachment.media_details?.height,
					description: attachment.description?.rendered || attachment.description,
				},
			},
		};
	} catch ( error ) {
		return null;
	}
}

/**
 * Get the complete client context for the AI agent
 * This includes current location and all context entries (sitemap, entities, etc.)
 */
export function getClientContext(): ClientContextType {
	const nextAdminStore = select( NEXT_ADMIN_STORE );

	// Get all context entries from ciab-admin store (includes sitemap and entities)
	const contextEntries = getCiabAdminContext( nextAdminStore );

	// Detect post and image entities
	const postEntity = detectPostEntity();
	const imageEntity = detectImageEntity();

	// Build the context object
	const context: ClientContextType = {
		url: window.location.href,
		pathname: window.location.pathname,
		search: window.location.search,
		environment: detectEnvironment(),
		...( contextEntries.length > 0 ? { contextEntries } : {} ),
		...( postEntity || {} ),
		...( imageEntity || {} ),
	};

	// eslint-disable-next-line no-console
	console.log( '[Agents Manager] Client context fetched:', context );

	return context;
}
