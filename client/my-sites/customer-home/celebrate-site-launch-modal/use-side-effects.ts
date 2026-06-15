import { updateLaunchpadSettings } from '@automattic/data-stores';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';

export function useCelebrateLaunchModalSideEffects( siteId: number ) {
	const dispatch = useDispatch();

	const addCelebrateLaunchQueryParams = () => {
		const url = new URL( window.location.href );
		url.searchParams.set( 'celebrateLaunch', 'true' );
		window.history.replaceState( {}, '', url.toString() );
	};

	const layout = useHomeLayoutQuery( siteId );

	return {
		addCelebrateLaunchQueryParams,
		onSiteLaunched: ( isWpcomAtomic: boolean ) => {
			addCelebrateLaunchQueryParams();
			dispatch( requestSite( siteId ) );
			layout?.refetch();

			if ( isWpcomAtomic ) {
				updateLaunchpadSettings( siteId, {
					checklist_statuses: { site_launched: true },
				} );
			}
		},
	};
}
