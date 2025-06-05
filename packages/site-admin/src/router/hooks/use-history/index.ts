/**
 * External dependencies
 */
import { useEvent } from '@wordpress/compose';
import { useContext, useMemo } from '@wordpress/element';
import { getQueryArgs, getPath, buildQueryString } from '@wordpress/url';
/**
 * Internal dependencies
 */
import { browserHistory, ConfigContext } from '../..';
/**
 * Types
 */
import type { NavigationOptions } from '../../types';

type UseNavigation = {
	/**
	 * Navigate to a given path with options.
	 */
	navigate: ( path: string, options?: NavigationOptions ) => void;

	/**
	 * Navigate back in browser history.
	 */
	back: () => void;
};

/**
 * Custom hook for handling navigation history within the application.
 *
 * This hook provides programmatic navigation capabilities, including
 * transitioning between pages, managing query parameters,
 * and handling back navigation.
 *
 * The `navigate` function passes the `state` option
 * from `NavigationOptions` to `browserHistory.push`.
 * This state can be later retrieved using the browser's history API
 * (e.g., `window.history.state`).
 *
 * Note: The `transition` option is currently not utilized
 * in this implementation.
 * @returns {UseNavigation} An object containing:
 * - `navigate`: A function to navigate to a given path with options.
 * - `back`: A function to navigate back in browser history.
 * @example
 * ```tsx
 * import useHistory from '../use-history';
 *
 * function MyComponent() {
 *   const { navigate, back } = useHistory();
 *
 *   const goToDashboard = () => {
 *     navigate( '/dashboard', {
 *       state: { from: 'home', user: 'JohnDoe' },
 *       transition: 'slide-in' // Note: currently not utilized
 *     } );
 *   };
 *
 *   const goBack = () => {
 *     back();
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={goToDashboard}>
 *         Go to Dashboard
 *       </button>
 *       <button onClick={goBack}>
 *         Go Back
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export default function useHistory(): UseNavigation {
	const { pathArg, beforeNavigate } = useContext( ConfigContext );

	const navigate = useEvent( ( rawPath: string, options: NavigationOptions = {} ) => {
		const query = getQueryArgs( rawPath );
		const path = getPath( 'http://domain.com/' + rawPath ) || '';

		const performPush = () => {
			const result = beforeNavigate ? beforeNavigate( { path, query } ) : { path, query };

			return browserHistory.push(
				{
					search: buildQueryString( {
						[ pathArg ]: result.path,
						...result.query,
					} ),
				},
				options.state
			);
		};

		performPush();
	} );

	return useMemo(
		() => ( {
			navigate,
			back: browserHistory.back,
		} ),
		[ navigate ]
	);
}
