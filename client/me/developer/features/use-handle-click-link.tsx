import { useCallback } from 'react';
import { useRecordTracksEventWithUserIsDevAccount } from './use-record-tracks-event-with-user-is-dev-account';

export const useHandleClickLink = () => {
	const recordTracksEventWithUserIsDevAccount = useRecordTracksEventWithUserIsDevAccount();

	return useCallback(
		( event: React.MouseEvent< HTMLAnchorElement > ) => {
			const prefixToRemove = '/support/';
			const pathIndex = event.currentTarget.href.indexOf( prefixToRemove );

			let featureSlug = event.currentTarget.href;
			if ( pathIndex !== -1 ) {
				featureSlug = featureSlug.substring( pathIndex + prefixToRemove.length );
			}
			featureSlug = featureSlug.replace( /^\/|\/$/g, '' );
			recordTracksEventWithUserIsDevAccount( 'calypso_me_developer_learn_more', {
				feature: featureSlug,
			} );
		},
		[ recordTracksEventWithUserIsDevAccount ]
	);
};
