import { isEnabled } from '@automattic/calypso-config';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { CatchNotFound, Outlet, useRouterState, useRouter } from '@tanstack/react-router';
import {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useState,
	useMemo,
	useSyncExternalStore,
} from 'react';
import { LoadingLine } from '../../components/loading-line';
import { PageViewTracker } from '../../components/page-view-tracker';
import NotFound from '../404';
import { bumpStat } from '../analytics';
import CommandPalette from '../command-palette';
import { useAppContext } from '../context';
import Header from '../header';
import { useOmnibarEvent } from '../interim-omnibar/click-handlers';
import { NavigationBlockerRegistry } from '../navigation-blocker';
import ResponsiveSidebar from '../responsive-sidebar';
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
	const isOmnibarEnabled = isEnabled( 'dashboard/omnibar' );
	const { name, supports, LoadingLogo = WordPressLogo } = useAppContext();
	const isFetching = useIsFetching();
	const router = useRouter();
	const queryClient = useQueryClient();
	const queryCache = queryClient.getQueryCache();
	const [ isSidebarOpen, setIsSidebarOpen ] = useState( false );
	const closeSidebar = useCallback( () => setIsSidebarOpen( false ), [ setIsSidebarOpen ] );
	useOmnibarEvent( 'mobileMenu', () => setIsSidebarOpen( ( v ) => ! v ) );
	useOmnibarEvent( 'linkClick', ( { href, event } ) => {
		const url = new URL( href, window.location.origin );

		if ( url.origin !== window.location.origin ) {
			return;
		}

		const path = url.pathname + url.search + url.hash;
		const parsedLocation = router.parseLocation( undefined, {
			pathname: url.pathname,
			search: url.search,
			hash: url.hash,
			href: path,
			state: { __TSR_index: 0 },
		} );
		const { foundRoute } = router.getMatchedRoutes( parsedLocation );

		if ( foundRoute ) {
			event.preventDefault();
			router.navigate( { to: path } );
		}
	} );

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

	const renderHeader = () => {
		if ( isInitialLoad ) {
			return null;
		}

		if ( ! isOmnibarEnabled ) {
			return <Header />;
		}

		return null;
	};

	const renderBody = () => {
		if ( isVerySlowNavigation ) {
			return null;
		}

		if ( ! isOmnibarEnabled ) {
			return (
				<main>
					<CatchNotFound fallback={ NotFound }>
						<Outlet />
					</CatchNotFound>
				</main>
			);
		}

		return (
			<div className="dashboard-root__body">
				<ResponsiveSidebar isOpen={ isSidebarOpen } onClose={ closeSidebar } />
				<div className="dashboard-root__content">
					<main>
						<CatchNotFound fallback={ NotFound }>
							<Outlet />
						</CatchNotFound>
					</main>
				</div>
			</div>
		);
	};

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
			{ renderHeader() }
			{ renderBody() }
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
