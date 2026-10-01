import { useEffect } from 'react';
import { getNormalizedPath } from './super-props';
import { useAnalytics } from '.';
import type { AppConfig } from '../context';
import type { AnyRouter } from '@tanstack/react-router';

export function useUnifiedAdminPageView(
	router: AnyRouter,
	app?: AppConfig[ 'unifiedAdminPageViewApp' ]
) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		if ( ! app ) {
			return;
		}

		const recordUnifiedPageView = () => {
			recordTracksEvent( 'wpcom_unified_admin_page_view', {
				source: 'msd',
				app,
				path: router.state.location.pathname,
				route: getNormalizedPath( router.state.matches, router.basepath ),
			} );
		};
		const unsubscribe = router.subscribe( 'onResolved', ( { pathChanged } ) => {
			if ( pathChanged ) {
				recordUnifiedPageView();
			}
		} );

		if ( router.state.status === 'idle' && router.state.matches.length ) {
			recordUnifiedPageView();
		}

		return unsubscribe;
	}, [ router, app, recordTracksEvent ] );
}
