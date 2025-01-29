import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { Store, UnknownAction } from 'redux';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding/constants';
import {
	USER_SETTINGS_SAVE_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { successNotice } from 'calypso/state/notices/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { isProfileComplete } from './utils';

function dispatchNotice( dispatch: Store[ 'dispatch' ] ) {
	dispatch(
		successNotice( translate( 'Profile complete!' ), {
			id: 'reader-profile-complete',
			button: translate( 'Return to Reader' ),
			onClick: () => {
				recordTracksEvent(
					`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }complete_account_profile_return`
				);
				page( '/read' );
			},
		} )
	);
}

export const dispatchProfileCompleteNotice = ( store: Store, action: UnknownAction ) => {
	const { dispatch, getState } = store;
	const state = getState();

	const fromReaderOnboarding = getCurrentQueryArguments( state )?.ref === 'reader-onboarding';
	if ( ! fromReaderOnboarding ) {
		return;
	}

	if ( action.type === USER_SETTINGS_SAVE_SUCCESS ) {
		const updatedSettings = {
			...state.userSettings.settings,
			...( typeof action.settingValues === 'object' ? action.settingValues : {} ),
		};

		if ( isProfileComplete( updatedSettings, state.gravatarStatus ) ) {
			dispatchNotice( dispatch );
		}
	}

	if ( action.type === GRAVATAR_UPLOAD_REQUEST_SUCCESS ) {
		const updatedSettings = { ...state.userSettings.settings, has_gravatar: true };
		if ( isProfileComplete( updatedSettings, state.gravatarStatus ) ) {
			dispatchNotice( dispatch );
		}
	}
};
