import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const useHandleClickLink = () => {
	const dispatch = useDispatch();

	return useCallback(
		( event: React.MouseEvent< HTMLAnchorElement > ) => {
			const feature = event.currentTarget.id ? event.currentTarget.id : event.currentTarget.href;
			dispatch(
				recordTracksEvent( 'calypso_me_developer_learn_more', {
					feature,
				} )
			);
		},
		[ dispatch ]
	);
};
