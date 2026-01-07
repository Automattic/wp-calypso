import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { CatchNotFound, Outlet, useRouterState, useRouter } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import { LoadingLine } from '../../components/loading-line';
import { PageViewTracker } from '../../components/page-view-tracker';
import NotFound from '../404';
import { bumpStat } from '../analytics';
import CommandPalette from '../command-palette';
import { useAppContext } from '../context';
import Header from '../header';
import { NavigationBlockerRegistry } from '../navigation-blocker';
import Snackbars from '../snackbars';
import './style.scss';

const WebpackBuildMonitor = lazy(
	() =>
		import(
			/* webpackChunkName: "async-webpack-build-monitor" */ 'calypso/components/webpack-build-monitor'
		)
);

const SLOW_THRESHOLD_MS = 100;
const VERY_SLOW_THRESHOLD_MS = 6000;

function Root() {
	const { name, supports, LoadingLogo = WordPressLogo } = useAppContext();
	const isFetching = useIsFetching();
	const router = useRouter();
	const queryClient = useQueryClient();
	const queryCache = queryClient.getQueryCache();

	const loadingQueryRequestedFullPageLoader = useSyncExternalStore(
		( onStoreChange ) => queryCache.subscribe( onStoreChange ),
		() => {
			const runningQueries = queryClient.getQueryCache().findAll( { fetchStatus: 'fetching' } );
			return runningQueries.some(
				( query ) => query.meta?.fullPageLoader && query.state.status === 'pending'
			);
		}
	);

	const { routeMeta, isNavigating, isInitialLoad } = useRouterState( {
		select: ( state ) => ( {
			routeMeta: state.matches.map( ( match ) => match.meta! ).filter( Boolean ),
			isNavigating: state.status === 'pending',

			// A little trick after investigation router state: it will initially be
			// empty, but remain set after subsequent navigations.
			// https://tanstack.com/router/latest/docs/framework/react/api/router/RouterStateType#resolvedlocation-property
			isInitialLoad: ! state.resolvedLocation,
		} ),
	} );

	const [ navigationTime, setNavigationTime ] = useState< 'none' | 'slow' | 'veryslow' >( 'none' );
	const isSlowNavigation = isNavigating && navigationTime === 'slow';
	const isVerySlowNavigation = isNavigating && navigationTime === 'veryslow';

	useEffect( () => {
		let slowTimeout: NodeJS.Timeout;
		let verySlowTimeout: NodeJS.Timeout;
		if ( isNavigating ) {
			slowTimeout = setTimeout( () => setNavigationTime( 'slow' ), SLOW_THRESHOLD_MS );
			verySlowTimeout = setTimeout( () => {
				const leafRouteId = router.state.pendingMatches?.at( -1 )?.routeId;
				if ( leafRouteId ) {
					bumpStat(
						'hd-very-slow-nav',
						// Tries to make the stats in the backend more readable. It isn't strictly necessary.
						// Removes leading and trailing slashes, replaces other slashes with dashes, removes $ from router path params.
						leafRouteId
							.replace( /^\//g, '' )
							.replace( /\/$/g, '' )
							.replace( /\//g, '-' )
							.replace( /\$/g, '' )
					);
				}
				setNavigationTime( 'veryslow' );
			}, VERY_SLOW_THRESHOLD_MS );
		} else {
			setNavigationTime( 'none' );
		}
		return () => {
			clearTimeout( slowTimeout );
			clearTimeout( verySlowTimeout );
		};
	}, [ isNavigating, router ] );

	const title = useMemo( () => {
		return routeMeta
			.map( ( metas ) => metas.find( ( meta ) => meta?.title )?.title )
			.filter( Boolean )
			.reverse()
			.join( ' ‹ ' );
	}, [ routeMeta ] );

	useEffect( () => {
		document.title = title ? `${ title } – ${ name }` : name;
	}, [ name, title ] );

	return (
		<div className="dashboard-root__layout">
			{ ( isFetching > 0 || isSlowNavigation ) && (
				<LoadingLine
					variant={
						isSlowNavigation || loadingQueryRequestedFullPageLoader ? 'progress' : 'spinner'
					}
					progressDuration={ `${ VERY_SLOW_THRESHOLD_MS }ms` }
				/>
			) }
			{ ( isInitialLoad || isVerySlowNavigation ) && <LoadingLogo className="wpcom-site__logo" /> }
			{ ! isInitialLoad && <Header /> }
			{ ! isVerySlowNavigation && (
				<main>
					<CatchNotFound fallback={ NotFound }>
						<Outlet />
					</CatchNotFound>
				</main>
			) }
			{ supports.commandPalette && <CommandPalette /> }
			<Snackbars />
			<PageViewTracker />
			<NavigationBlockerRegistry />
			{ 'development' === process.env.NODE_ENV && (
				<Suspense fallback={ null }>
					<WebpackBuildMonitor />
				</Suspense>
			) }
		</div>
	);
}

export default Root;
