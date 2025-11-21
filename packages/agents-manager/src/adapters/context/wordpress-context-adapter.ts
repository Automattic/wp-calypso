import type { ClientContext, ContextAdapter } from './context-adapter';

/**
 * Context entry types
 */
export interface EntityContextEntry {
	id: string;
	type: 'entity';
	entityType: string;
	entityId: string;
	getData?: () => any;
	data?: any;
}

export interface SitemapContextEntry {
	id: 'sitemap';
	type: 'sitemap';
	getData?: () => any;
	data?: any;
}

export type ContextEntry = EntityContextEntry | SitemapContextEntry;

/**
 * WordPress Context Adapter
 *
 * Provides context information from WordPress environment using @wordpress/data stores.
 * Supports wp-admin, block-editor, and site-editor contexts.
 * Includes support for Next Admin contextEntries (sitemap, entities).
 *
 * Requires @wordpress/data to be available in the environment.
 */
export class WordPressContextAdapter implements ContextAdapter {
	private environment: string;
	private wpData: any;
	private selectFn: any;

	/**
	 * Create a new WordPress Context Adapter
	 * @param {string} environment - Environment identifier ('wp-admin', 'block-editor', 'site-editor')
	 * @param {any} wpData - Optional @wordpress/data module (auto-detected if not provided)
	 */
	constructor(
		environment: 'wp-admin' | 'block-editor' | 'site-editor' = 'wp-admin',
		wpData?: any
	) {
		this.environment = environment;

		// Try to get @wordpress/data if not provided
		if ( wpData ) {
			this.wpData = wpData;
			this.selectFn = wpData.select;
		} else if ( typeof window !== 'undefined' && ( window as any ).wp?.data ) {
			this.wpData = ( window as any ).wp.data;
			this.selectFn = this.wpData.select;
		}
	}

	async getContext(): Promise< ClientContext > {
		const context: ClientContext = {
			url: window.location.href,
			pathname: window.location.pathname,
			environment: this.environment,
		};

		// Add WordPress-specific context if available
		if ( this.selectFn ) {
			try {
				const additionalData: Record< string, unknown > = {};

				// Get context entries (includes sitemap and entities)
				const contextEntries = this.getContextEntries();
				if ( contextEntries && contextEntries.length > 0 ) {
					additionalData.contextEntries = contextEntries;
				}

				// For backward compatibility, also add sitemap and entities separately
				const sitemap = await this.getSitemap();
				if ( sitemap ) {
					additionalData.sitemap = sitemap;
				}

				const entityData = await this.getEntityData();
				if ( entityData ) {
					additionalData.entities = entityData;
				}

				if ( Object.keys( additionalData ).length > 0 ) {
					context.additionalData = additionalData;
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[WordPressContextAdapter] Error getting additional context:', error );
			}
		}

		return context;
	}

	getEnvironment(): string {
		return this.environment;
	}

	/**
	 * Get context entries from next-admin store
	 * Resolves getData closures to get current data
	 */
	getContextEntries(): ContextEntry[] | undefined {
		if ( ! this.selectFn ) {
			return undefined;
		}

		try {
			const nextAdminStore = this.selectFn( 'next-admin' );
			if ( ! nextAdminStore?.getContextEntries ) {
				return undefined;
			}

			const entries = nextAdminStore.getContextEntries();
			if ( ! entries || entries.length === 0 ) {
				return undefined;
			}

			// Resolve getData closures to get current data
			return entries.map( ( entry: ContextEntry ) => {
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
					console.warn(
						`[WordPressContextAdapter] Error resolving getData for entry ${ entry.id }:`,
						error
					);
					return entry;
				}
			} );
		} catch ( error ) {
			// Store might not be available, that's ok
			return undefined;
		}
	}

	async getSitemap(): Promise< unknown > {
		if ( ! this.selectFn ) {
			return undefined;
		}

		try {
			// Try to get from next-admin store
			const nextAdminStore = this.selectFn( 'next-admin' );
			if ( nextAdminStore?.getContextEntries ) {
				const entries = nextAdminStore.getContextEntries();
				return entries?.sitemap;
			}
		} catch ( error ) {
			// Store might not be available, that's ok
		}

		return undefined;
	}

	async getEntityData(): Promise< unknown > {
		if ( ! this.selectFn ) {
			return undefined;
		}

		try {
			// Get context entries from next-admin store
			const nextAdminStore = this.selectFn( 'next-admin' );
			if ( nextAdminStore?.getContextEntries ) {
				const entries = nextAdminStore.getContextEntries();
				return entries?.entities;
			}
		} catch ( error ) {
			// Store might not be available, that's ok
		}

		return undefined;
	}

	onContextChange( callback: () => void ): () => void {
		if ( ! this.wpData?.subscribe ) {
			return () => {};
		}

		// Subscribe to WordPress data changes
		return this.wpData.subscribe( callback );
	}
}
