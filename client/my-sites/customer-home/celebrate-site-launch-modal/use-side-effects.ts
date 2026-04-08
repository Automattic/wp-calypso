import { updateLaunchpadSettings } from '@automattic/data-stores';
import { UseQueryResult } from '@tanstack/react-query';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';

export function useCelebrateLaunchModalSideEffects(
	siteId: number,
	layout: UseQueryResult | null
) {
	const dispatch = useDispatch();

	const addCelebrateLaunchQueryParams = () => {
		const url = new URL( window.location.href );
		url.searchParams.set( 'celebrateLaunch', 'true' );
		window.history.replaceState( {}, '', url.toString() );
	};

	return {
		addCelebrateLaunchQueryParams,
		onSiteLaunched: ( isWpcomAtomic: boolean ) => {
			addCelebrateLaunchQueryParams();

			dispatch( requestSite( siteId ) );

			if ( isWpcomAtomic ) {
				updateLaunchpadSettings( siteId, {
					checklist_statuses: { site_launched: true },
				} );
			}
		},
		onModalClosed: () => {
			layout?.refetch();
		},
	};
}
