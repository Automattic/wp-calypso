/**
 * External dependencies
 */
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

export const useTrackUpsellView = (
	siteId: number | null
): RefObject< HTMLAnchorElement | HTMLButtonElement > => {
	const viewedRef = useRef< boolean >( false );
	const elementRef = useRef< HTMLAnchorElement | HTMLButtonElement >( null );
	const observerRef = useRef< IntersectionObserver >();

	const dispatch = useDispatch();

	useEffect( () => {
		// We can't do anything without a valid reference to an element on the page
		if ( ! elementRef.current ) {
			return;
		}

		// If the observer is already defined, no need to continue
		if ( observerRef.current ) {
			return;
		}

		const handler = ( entries: IntersectionObserverEntry[] ) => {
			// Only fire once per page load
			if ( viewedRef.current ) {
				return;
			}

			const [ entry ] = entries;
			if ( ! entry.isIntersecting ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_activitylog_retentionlimit_view', {
					site_id: siteId ?? undefined,
				} )
			);

			viewedRef.current = true;
		};

		observerRef.current = new IntersectionObserver( handler, {
			// Only fire the event when 100% of the element becomes visible
			threshold: [ 1 ],
		} );
		observerRef.current.observe( elementRef.current );

		// When the effect is dismounted, stop observing
		return () => observerRef.current?.disconnect?.();
	}, [ dispatch, siteId ] );

	return elementRef;
};

export const useTrackUpgradeClick = ( siteId: number | null ): ( () => void ) => {
	const dispatch = useDispatch();

	return useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_activitylog_retentionlimit_upgrade_click', {
				site_id: siteId ?? undefined,
			} )
		);
	}, [ dispatch, siteId ] );
};
