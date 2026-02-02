import { queryClient } from '@automattic/api-queries';
import clsx from 'clsx';
import { useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';
import PulsingDot from 'calypso/components/pulsing-dot';
import { isSectionLoading } from 'calypso/state/ui/selectors';
import './loader.scss';

export default function LayoutLoader() {
	const isLoading = useSelector( isSectionLoading );
	const queryCache = queryClient.getQueryCache();

	const isLoadingWithFullPageLoader = useSyncExternalStore(
		( onStoreChange ) => queryCache.subscribe( onStoreChange ),
		() => {
			const fullPageLoaderQueries = queryClient
				.getQueryCache()
				.findAll()
				.filter( ( query ) => query.meta?.fullPageLoader );

			// Only show loader after initial data has loaded (at least one query completed).
			const hasCompletedFetch = fullPageLoaderQueries.some(
				( query ) => query.state.status === 'success' && query.state.fetchStatus === 'idle'
			);

			if ( ! hasCompletedFetch ) {
				return false;
			}

			// Only show loader if we don't have cached data yet.
			return fullPageLoaderQueries.some(
				( query ) => query.state.fetchStatus === 'fetching' && query.state.status !== 'success'
			);
		}
	);

	const showLoader = isLoading || isLoadingWithFullPageLoader;

	return (
		<div className={ clsx( 'layout__loader', { 'is-active': showLoader } ) }>
			{ showLoader && <PulsingDot delay={ 400 } active /> }
		</div>
	);
}
