import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const useTrackCallback = (
	callback: ( ...args: unknown[] ) => void = noop,
	eventName: string,
	eventProps = {}
) => {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const trackedCallback = useCallback(
		( ...rest: unknown[] ) => {
			dispatch(
				recordTracksEvent( eventName, {
					site_id: siteId,
					...eventProps,
				} )
			);
			callback( ...rest );
		},
		[ callback, eventName, dispatch, siteId ]
	);
	return trackedCallback;
};

export default useTrackCallback;
