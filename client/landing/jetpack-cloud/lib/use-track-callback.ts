/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';

const useTrackCallback = ( eventName: string, callback: Function ) => {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const trackedCallback = React.useCallback(
		( ...rest ) => {
			dispatch(
				recordTracksEvent( eventName, {
					site_id: siteId,
				} )
			);
			callback( ...rest );
		},
		[ callback, eventName, dispatch, siteId ]
	);
	return trackedCallback;
};

export default useTrackCallback;
