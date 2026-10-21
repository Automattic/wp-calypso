import { isWpError } from '@automattic/api-core';
import { userPreferenceQuery, userPreferenceOptimisticMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { useAppContext } from '../context';
import { resolveVisitAreaSlug } from '../survicate/visit-areas';

const DAY_IN_MS = 86400000;

/**
 * Whether two `Date.now()`-style timestamps fall on the same calendar day
 * (UTC-day boundaries, matching `client/state/persistent-counter`).
 */
export function isSameDay( a: number, b: number ): boolean {
	return Math.floor( a / DAY_IN_MS ) === Math.floor( b / DAY_IN_MS );
}

/**
 * Marks a visit to a dashboard area, incrementing its backend-persisted counter
 * at most once per calendar day. The count is published to Survicate as a
 * visitor trait by `useSurvicateVisitTraits`; see `app/survicate/visit-areas.ts`.
 * @param area Slug from the `VISIT_AREAS` registry, or `null` for no tracked area.
 */
export function usePersistentVisitCounter( area: string | null ): void {
	// Shares the `[ 'me', 'preferences' ]` query cache with every other
	// preference consumer, so this never triggers an extra fetch. Disabled when
	// there is no tracked area, so the placeholder key is never queried.
	const preferenceName = `hosting-dashboard-visit-count-${ area ?? '' }` as const;
	const { data: counter, isSuccess } = useQuery( {
		...userPreferenceQuery( preferenceName ),
		enabled: !! area,
	} );
	const { mutate } = useMutation( userPreferenceOptimisticMutation( preferenceName ) );

	// Tracks the area value we last evaluated, so a given area is counted at most
	// once per navigation to it — even when the optimistic update re-runs the
	// effect or React StrictMode double-mounts.
	const evaluatedFor = useRef< string | null >( null );

	useEffect( () => {
		if ( ! area || ! isSuccess ) {
			return;
		}
		if ( evaluatedFor.current === area ) {
			return;
		}
		evaluatedFor.current = area;

		const now = Date.now();
		const lastUpdated = counter?.lastUpdated ?? null;
		if ( lastUpdated !== null && isSameDay( lastUpdated, now ) ) {
			return;
		}

		mutate(
			{
				count: ( counter?.count ?? 0 ) + 1,
				lastUpdated: now,
			},
			{
				onError: ( error ) => {
					logToLogstash( {
						feature: 'calypso_client',
						message: error.message,
						tags: [ 'dashboard', 'visit-counter-update-fail' ],
						properties: {
							status: isWpError( error ) ? error.status : undefined,
							error_name: isWpError( error ) ? error.name : undefined,
							env_id: config( 'env_id' ),
							message: error.message,
							path: window.location.href,
							area,
						},
					} );
				},
			}
		);
	}, [ area, isSuccess, counter, mutate ] );
}

/**
 * Resolves the current dashboard route to a visit-area and marks a visit to it.
 * Mounted once inside the router tree (the root route component).
 */
export function useTrackVisitedAreas(): void {
	const enabled = config( 'survicate_enabled' );
	const { basePath } = useAppContext();
	const area = useRouterState( {
		select: ( state ) => resolveVisitAreaSlug( state.location.pathname, basePath ),
	} );
	usePersistentVisitCounter( enabled ? area : null );
}
