import { useCallback, useEffect, useRef, useState } from 'react';

const batchSize = 24;

export default function useResourceLoadMore( total: number, queryKey: string, paused: boolean ) {
	const [ batch, setBatch ] = useState( { queryKey, count: batchSize } );
	if ( batch.queryKey !== queryKey ) {
		setBatch( { queryKey, count: batchSize } );
	}
	const count = batch.queryKey === queryKey ? batch.count : batchSize;
	const visibleCount = Math.min( count, total );
	const hasMore = visibleCount < total;
	const sentinelRef = useRef< HTMLDivElement >( null );
	const loadMore = useCallback( () => {
		setBatch( ( current ) => ( {
			queryKey,
			count: Math.min(
				( current.queryKey === queryKey ? current.count : batchSize ) + batchSize,
				total
			),
		} ) );
	}, [ queryKey, total ] );

	useEffect( () => {
		const sentinel = sentinelRef.current;
		if ( ! sentinel || ! hasMore || paused || ! ( 'IntersectionObserver' in window ) ) {
			return;
		}
		let active = true;
		const observer = new IntersectionObserver(
			( entries ) => {
				if (
					active &&
					! sentinel.parentElement?.contains( document.activeElement ) &&
					entries.some( ( entry ) => entry.isIntersecting )
				) {
					active = false;
					observer.disconnect();
					loadMore();
				}
			},
			{ rootMargin: '0px 0px 300px 0px' }
		);
		observer.observe( sentinel );
		return () => {
			active = false;
			observer.disconnect();
		};
	}, [ hasMore, loadMore, paused, visibleCount ] );

	return { visibleCount, hasMore, loadMore, sentinelRef };
}
