import { getSiteSpecUrlByType, ResourceType } from './utils';

/**
 * Types and configuration
 */

interface ResourceConfig {
	tagName: 'script' | 'link';
	attributes: Record< string, string >;
	errorMessage: string;
	elementId: string;
	urlAttr: 'src' | 'href';
}

const RESOURCE_CONFIGS: Record< ResourceType, ResourceConfig > = {
	script: {
		tagName: 'script',
		attributes: { type: 'text/javascript' },
		errorMessage: 'Failed to load SiteSpec script from',
		elementId: 'site-spec',
		urlAttr: 'src',
	},
	css: {
		tagName: 'link',
		attributes: { rel: 'stylesheet' },
		errorMessage: 'Failed to load SiteSpec CSS from',
		elementId: 'site-spec-styles',
		urlAttr: 'href',
	},
};

/**
 * Internal state and utilities
 */
/**
 * Cache in-flight loads per (type,url) so repeated calls share a single promise.
 * This prevents duplicate requests when multiple components try to load the same resource.
 */
const loadingPromises = new Map< string, Promise< void > >();

/**
 * Ensures the DOM is available for resource injection.
 * @throws {Error} When running in SSR or non-browser environment
 */
function ensureDomAvailable(): void {
	// If running in SSR or a non-browser environment, bail early with a helpful message.
	if ( typeof document === 'undefined' || ! document?.head ) {
		throw new Error(
			'SiteSpec assets can only be loaded in a browser environment (no document/head).'
		);
	}
}

/**
 * Generates a unique cache key for a resource type and URL combination.
 * @param type - The type of resource ({@link ResourceType})
 * @param url - The URL of the resource
 * @returns A unique cache key string
 */
function cacheKeyFor( type: ResourceType, url: string ): string {
	return `${ type }:${ url }`;
}

/**
 * Checks if a resource with the exact URL already exists in the DOM.
 * @param url - The URL of the resource to check
 * @param type - The type of resource ({@link ResourceType})
 * @returns True if the resource exists in the DOM, false otherwise
 */
function isResourceInDOM( url: string, type: ResourceType ): boolean {
	const config = RESOURCE_CONFIGS[ type ];
	const selector =
		type === 'script'
			? `script[${ config.urlAttr }="${ url }"]`
			: `link[${ config.urlAttr }="${ url }"]`;
	return !! document.querySelector( selector );
}

/**
 * Loading logic
 */

/**
 * Generic injector used by both CSS & script.
 * Creates and injects DOM elements for resource loading.
 * @param url - The URL of the resource to inject
 * @param type - The type of resource ({@link ResourceType})
 * @returns Promise that resolves when the resource is loaded
 * @throws {Error} When resource loading fails
 */
function injectResource( url: string, type: ResourceType ): Promise< void > {
	ensureDomAvailable();
	const config = RESOURCE_CONFIGS[ type ];

	return new Promise< void >( ( resolve, reject ) => {
		const element = document.createElement( config.tagName ) as HTMLScriptElement | HTMLLinkElement;

		element.id = config.elementId;

		// Set common attributes
		for ( const [ attributeKey, attributeValue ] of Object.entries( config.attributes ) ) {
			element.setAttribute( attributeKey, attributeValue );
		}

		// Set URL attribute based on resource type (src for script, href for CSS)
		if ( config.urlAttr === 'src' ) {
			const scriptElement = element as HTMLScriptElement;
			scriptElement.src = url;
			scriptElement.async = true;
		} else {
			const linkElement = element as HTMLLinkElement;
			linkElement.href = url;
		}

		element.onload = () => resolve();
		element.onerror = () => reject( new Error( `${ config.errorMessage } ${ url }` ) );

		document.head.appendChild( element );
	} );
}

/**
 * Ensures a specific resource is loaded, with intelligent caching to prevent duplicate requests.
 * @private
 * @param url - The URL of the resource to load
 * @param type - The type of resource ({@link ResourceType})
 * @returns Promise that resolves when the resource is loaded
 */
function ensureResourceLoaded( url: string, type: ResourceType ): Promise< void > {
	// Exists in DOM? done
	if ( isResourceInDOM( url, type ) ) {
		return Promise.resolve();
	}

	const key = cacheKeyFor( type, url );
	const existingPromise = loadingPromises.get( key );
	if ( existingPromise ) {
		return existingPromise;
	}

	// Start a new load and cache it until it settles.
	const loadPromise = injectResource( url, type ).finally( () => {
		loadingPromises.delete( key );
	} );

	loadingPromises.set( key, loadPromise );
	return loadPromise;
}

/**
 * Loads a specific resource type (script or CSS).
 * @param type - The type of resource to load ({@link ResourceType})
 * @returns Promise that resolves when the resource is loaded
 * @throws {Error} When resource URL is not configured
 */
async function loadResource( type: ResourceType ): Promise< void > {
	const url = getSiteSpecUrlByType( type );
	if ( ! url ) {
		throw new Error( `SiteSpec ${ type } URL not configured` );
	}
	return ensureResourceLoaded( url, type );
}

/**
 * Loads both SiteSpec CSS and JavaScript resources in the correct order.
 * @async
 * @returns Promise that resolves when both resources are loaded
 * @throws {Error} When resource URLs are not configured or loading fails
 */
export async function loadSiteSpecScriptAndCSS(): Promise< void > {
	await loadResource( 'css' );
	await loadResource( 'script' );
	return;
}

/**
 * Resets the loader's internal state without affecting existing DOM elements.
 * @returns {void}
 */
export function resetSiteSpecScriptState(): void {
	loadingPromises.clear();
}
