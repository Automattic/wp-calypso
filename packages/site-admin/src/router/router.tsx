/**
 * External dependencies
 */
import { useEvent } from '@wordpress/compose';
import { useContext, useMemo } from '@wordpress/element';
import { getQueryArgs, getPath, buildQueryString } from '@wordpress/url';
/**
 * Internal dependencies
 */
import { browserHistory, ConfigContext } from '.';

interface NavigationOptions {
	transition?: string;
	state?: Record< string, any >;
}

export function useHistory() {
	const { pathArg, beforeNavigate } = useContext( ConfigContext );

	const navigate = useEvent( async ( rawPath: string, options: NavigationOptions = {} ) => {
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

		/*
		 * Skip transition in mobile, otherwise it crashes the browser.
		 * See: https://github.com/WordPress/gutenberg/pull/63002.
		 */
		const isMediumOrBigger = window.matchMedia( '(min-width: 782px)' ).matches;
		if ( ! isMediumOrBigger || ! document.startViewTransition || ! options.transition ) {
			performPush();
			return;
		}

		await new Promise< void >( ( resolve ) => {
			const classname = options.transition ?? '';
			document.documentElement.classList.add( classname );
			const transition = document.startViewTransition( () => performPush() );
			transition.finished.finally( () => {
				document.documentElement.classList.remove( classname );
				resolve();
			} );
		} );
	} );

	return useMemo(
		() => ( {
			navigate,
			back: browserHistory.back,
		} ),
		[ navigate ]
	);
}
