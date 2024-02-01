import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent, enhanceWithUserIsDevAccount } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import type { AnyAction, Store } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

export const useHandleClickLink = () => {
	const dispatch = useDispatch() as ThunkDispatch< Store, void, AnyAction >;

	return useCallback(
		( event: React.MouseEvent< HTMLAnchorElement > ) => {
			const recordEvent = withEnhancers( recordTracksEvent, [ enhanceWithUserIsDevAccount ] );

			const prefixToRemove = '/support/';
			const pathIndex = event.currentTarget.href.indexOf( prefixToRemove );

			let featureSlug = event.currentTarget.href;
			if ( pathIndex !== -1 ) {
				featureSlug = featureSlug.substring( pathIndex + prefixToRemove.length );
			}

			dispatch( recordEvent( 'calypso_me_developer_learn_more', { feature: featureSlug } ) );
		},
		[ dispatch ]
	);
};
