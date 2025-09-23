import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useIsFetching } from '@tanstack/react-query';
import { CatchNotFound, Outlet, useRouterState, useRouter } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { LoadingLine } from '../../components/loading-line';
import { PageViewTracker } from '../../components/page-view-tracker';
import NotFound from '../404';
import { bumpStat } from '../analytics';
import CommandPalette from '../command-palette';
import { useAppContext } from '../context';
import Header from '../header';
import { useRouteTitles } from '../hooks/use-route-titles';
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
	const { name, LoadingLogo = WordPressLogo } = useAppContext();
	const isFetching = useIsFetching();
	const router = useRouter();
	const routeTitles = useRouteTitles();
	const { isNavigating, isInitialLoad } = useRouterState( {
		select: ( state ) => ( {
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

	useEffect( () => {
		document.title = routeTitles.length > 0 ? `${ routeTitles.join( ' ‹ ' ) } – ${ name }` : name;
	}, [ name, routeTitles ] );

	return (
		<div className="dashboard-root__layout">
			{ ( isFetching > 0 || isSlowNavigation ) && (
				<LoadingLine
					variant={ isSlowNavigation ? 'progress' : 'spinner' }
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
			<CommandPalette />
			<Snackbars />
			<PageViewTracker />
			{ 'development' === process.env.NODE_ENV && (
				<Suspense fallback={ null }>
					<WebpackBuildMonitor />
				</Suspense>
			) }
		</div>
	);
}

export default Root;
