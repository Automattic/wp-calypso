import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';

export function useCelebrateLaunchModalSideEffects(
	siteId: number,
	layout: { refetch: () => void } | null
) {
	const dispatch = useDispatch();

	return {
		onSiteLaunched: ( isWpcomAtomic: boolean ) => {
			const url = new URL( window.location.href );
			url.searchParams.set( 'celebrateLaunch', 'true' );
			window.history.replaceState( {}, '', url.toString() );

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
