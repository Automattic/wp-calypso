import { useCallback } from 'react';
import { useRecordTracksEventWithUserIsDevAccount } from './use-record-tracks-event-with-user-is-dev-account';

export const useHandleClickLink = () => {
	const recordTracksEventWithUserIsDevAccount = useRecordTracksEventWithUserIsDevAccount();

	return useCallback(
		( event: React.MouseEvent< HTMLAnchorElement > ) => {
			const feature = event.currentTarget.id ? event.currentTarget.id : event.currentTarget.href;
			recordTracksEventWithUserIsDevAccount( 'calypso_me_developer_learn_more', {
				feature,
			} );
		},
		[ recordTracksEventWithUserIsDevAccount ]
	);
};
