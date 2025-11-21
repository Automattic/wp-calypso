/**
 * Context data provided to the AI agent
 */
export interface ClientContext {
	/**
	 * Current URL
	 */
	url: string;
	/**
	 * Current pathname
	 */
	pathname: string;
	/**
	 * Environment identifier (e.g., 'wp-admin', 'calypso', 'block-editor')
	 */
	environment: string;
	/**
	 * Additional context data (sitemap, entities, etc.)
	 */
	additionalData?: Record< string, unknown >;
}

/**
 * Context Adapter Interface
 *
 * Provides context information to the AI agent based on the current environment.
 * Different implementations can provide context for WordPress, Calypso, or custom environments.
 */
export interface ContextAdapter {
	/**
	 * Get the current context for the AI agent
	 * @returns {Promise<ClientContext>} The current context
	 */
	getContext(): Promise< ClientContext >;

	/**
	 * Get the environment identifier
	 * @returns {string} Environment name (e.g., 'wp-admin', 'calypso', 'block-editor')
	 */
	getEnvironment(): string;

	/**
	 * Optional: Get sitemap data if available
	 * @returns {Promise<unknown> | undefined} Sitemap data
	 */
	getSitemap?(): Promise< unknown >;

	/**
	 * Optional: Get entity data if available
	 * @returns {Promise<unknown> | undefined} Entity data
	 */
	getEntityData?(): Promise< unknown >;

	/**
	 * Optional: Listen for context changes and call the callback when context updates
	 * @param {Function} callback - Callback to call when context changes
	 * @returns {Function | undefined} Cleanup function
	 */
	onContextChange?( callback: () => void ): () => void;
}
