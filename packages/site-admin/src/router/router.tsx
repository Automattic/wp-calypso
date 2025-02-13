/**
 * External dependencies
 */
import { useEvent } from '@wordpress/compose';
import { useContext, useSyncExternalStore, useMemo } from '@wordpress/element';
import { getQueryArgs, getPath, buildQueryString } from '@wordpress/url';
import { createBrowserHistory } from 'history';
import RouteRecognizer from 'route-recognizer';
/**
 * Internal dependencies
 */
import { ConfigContext, RoutesContext } from '.';
import { useMatch } from './';
/**
 * Types
 */
import type { BeforeNavigate, Route } from './types';
import type { ReactNode } from 'react';

const history = createBrowserHistory();

export interface NavigationOptions {
	transition?: string;
	state?: Record< string, any >;
}

const locationMemo = new WeakMap();
function getLocationWithQuery() {
	const location = history.location;
	let locationWithQuery = locationMemo.get( location );
	if ( ! locationWithQuery ) {
		locationWithQuery = {
			...location,
			query: Object.fromEntries( new URLSearchParams( location.search ) ),
		};
		locationMemo.set( location, locationWithQuery );
	}
	return locationWithQuery;
}

interface RouterProviderProps {
	routes: Route[];
	pathArg: string;
	beforeNavigate?: BeforeNavigate;
	children: ReactNode;
}

export function useHistory() {
	const { pathArg, beforeNavigate } = useContext( ConfigContext );

	const navigate = useEvent( async ( rawPath: string, options: NavigationOptions = {} ) => {
		const query = getQueryArgs( rawPath );

		const path = getPath( 'http://domain.com/' + rawPath ) || '';
		const performPush = () => {
			const result = beforeNavigate ? beforeNavigate( { path, query } ) : { path, query };

			return history.push(
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
			back: history.back,
		} ),
		[ navigate ]
	);
}

export function RouterProvider( {
	routes,
	pathArg,
	beforeNavigate,
	children,
}: RouterProviderProps ) {
	const location = useSyncExternalStore(
		history.listen,
		getLocationWithQuery,
		getLocationWithQuery
	);
	const matcher = useMemo( () => {
		const ret = new RouteRecognizer();
		routes.forEach( ( route ) => {
			ret.add( [ { path: route.path, handler: route } ], {
				as: route.name,
			} );
		} );
		return ret;
	}, [ routes ] );

	const match = useMatch( location, matcher, pathArg );
	const config = useMemo( () => ( { beforeNavigate, pathArg } ), [ beforeNavigate, pathArg ] );

	return (
		<ConfigContext.Provider value={ config }>
			<RoutesContext.Provider value={ match }>{ children }</RoutesContext.Provider>
		</ConfigContext.Provider>
	);
}
