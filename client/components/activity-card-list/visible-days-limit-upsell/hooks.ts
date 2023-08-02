import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

export const useTrackUpsellView = ( siteId: number | null ) => {
	const dispatch = useDispatch();

	const { ref } = useInView( {
		onChange: ( inView: boolean ) => {
			if ( inView ) {
				dispatch(
					recordTracksEvent( 'calypso_activitylog_visiblelimit_upsell_view', {
						site_id: siteId ?? undefined,
					} )
				);
			}
		},
		triggerOnce: true,
	} );

	return ref;
};

export const useTrackUpgradeClick = ( siteId: number | null ): ( () => void ) => {
	const dispatch = useDispatch();

	return useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_activitylog_visiblelimit_upsell_click', {
				site_id: siteId ?? undefined,
			} )
		);
	}, [ dispatch, siteId ] );
};
