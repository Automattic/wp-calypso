/**
 * External dependencies
 */
import { useContext, useMemo } from '@wordpress/element';
import { getQueryArgs, getPath, buildQueryString } from '@wordpress/url';
/**
 * Internal dependencies
 */
import { ConfigContext } from '../..';
import useHistory from '../use-history';
/**
 * Types
 */
import type { NavigationOptions } from '../../types';

type UseLink = {
	/**
	 * The full navigation URL including query parameters.
	 */
	href: string;

	/**
	 * A function to handle link navigation via `history.navigate`.
	 */
	onClick: ( event: React.SyntheticEvent< HTMLAnchorElement > ) => void;
};

/**
 * Custom hook for generating navigation links within the routing system.
 *
 * This hook constructs a properly formatted navigation link by utilizing the routing context.
 * It ensures correct query string handling and allows interception via `beforeNavigate`.
 * @param {string} to                   - The target path for the navigation link.
 * @param {NavigationOptions} [options] - Optional navigation options such as transition and state.
 * @returns {UseLink} An object containing:
 * - `href`: The full navigation URL including query parameters.
 * - `onClick`: A function to handle link navigation via `history.navigate`.
 * @example
 * ```tsx
 * import useLink from '../use-link';
 *
 * function MyComponent() {
 *     // Generates a link pointing to '/dashboard?p=active'
 *     const { href, onClick } = useLink( '/dashboard?filter=active' );
 *     return <a href={ href } onClick={ onClick }>Go to Dashboard</a>;
 * }
 * ```
 */
export default function useLink( to: string, options: NavigationOptions = {} ): UseLink {
	const history = useHistory();
	const { pathArg, beforeNavigate } = useContext( ConfigContext );

	function onClick( event: React.SyntheticEvent< HTMLAnchorElement > ) {
		event?.preventDefault();
		history.navigate( to, options );
	}

	const query = getQueryArgs( to );

	const path = getPath( 'http://domain.com/' + to ) || '';
	const link = useMemo( () => {
		return beforeNavigate ? beforeNavigate( { path, query } ) : { path, query };
	}, [ path, query, beforeNavigate ] );

	const [ before ] = window.location.href.split( '?' );

	return {
		href: `${ before }?${ buildQueryString( {
			[ pathArg ]: link.path,
			...link.query,
		} ) }`,
		onClick,
	};
}
