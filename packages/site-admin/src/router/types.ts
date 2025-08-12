import type { ReactNode } from 'react';

/**
 * Defines the structure for a navigation event before it occurs.
 * Allows transformation of the path and query parameters before navigating.
 */
export type BeforeNavigate = ( arg: { path: string; query: Record< string, any > } ) => {
	/**
	 * The destination path.
	 */
	path: string;

	/**
	 * Query parameters for the navigation.
	 */
	query: Record< string, any >;
};

/**
 * Configuration settings for the router.
 */
export interface Config {
	/**
	 * The argument used for path identification.
	 */
	pathArg: string;

	/**
	 * Optional function to modify navigation behavior.
	 */
	beforeNavigate?: BeforeNavigate;
}

/**
 * Represents a matched route in the routing system.
 */
export interface Match {
	/**
	 * Name of the matched route.
	 */
	name: string;

	/**
	 * The path associated with the match.
	 */
	path: string;

	/**
	 * UI areas related to the match.
	 */
	areas: Record< string, ReactNode >;

	/**
	 * Width configuration for UI areas.
	 */
	widths: Record< string, number >;

	/**
	 * Optional query parameters.
	 */
	query?: Record< string, any >;

	/**
	 * Optional route parameters.
	 */
	params?: Record< string, any >;
}

/**
 * Represents a browser location with an optional query object.
 */
export type LocationWithQuery = Location & {
	/**
	 * Optional query parameters attached to the location.
	 */
	query?: Record< string, any >;
};

/**
 * Defines a single route within the router system.
 */
export interface Route {
	/**
	 * Name of the route.
	 */
	name: string;

	/**
	 * Path pattern for the route.
	 */
	path: string;

	/**
	 * UI areas associated with the route.
	 */
	areas: Record< string, ReactNode >;

	/**
	 * Width settings for different UI areas.
	 */
	widths: Record< string, number >;
}

/**
 * Props expected by the RouterProvider component.
 */
export interface RouterProviderProps {
	/**
	 * List of available routes.
	 * @default []
	 */
	routes?: Route[];

	/**
	 * Defines the URL query parameter that stores the current path.
	 * @default 'p'
	 */
	pathArg?: string;

	/**
	 * Optional navigation behavior modifier.
	 */
	beforeNavigate?: BeforeNavigate;

	/**
	 * Child components rendered within the provider.
	 */
	children: ReactNode;
}

/**
 * Options available when performing a navigation action.
 */
export interface NavigationOptions {
	/**
	 * Specifies the type of transition to be used during navigation.
	 */
	transition?: string;

	/**
	 * Custom state object that persists across navigation.
	 */
	state?: Record< string, any >;
}
