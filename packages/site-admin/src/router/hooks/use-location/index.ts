/**
 * External dependencies
 */
import { useContext } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { RoutesContext } from '../..';
/**
 * useLocation
 * Custom hook that provides access to the current routing context.
 * It retrieves the location data from the `RoutesContext`.
 * ```tsx
 * import useLocation from '../use-location';
 *
 * function MyComponent() {
 *     const { path } = useLocation();
 *     return <div>Current Path: { path }</div>;
 * }
 * ```
 */
export default function useLocation() {
	const context = useContext( RoutesContext );
	if ( ! context ) {
		throw new Error( 'useLocation must be used within a RouterProvider' );
	}
	return context;
}
