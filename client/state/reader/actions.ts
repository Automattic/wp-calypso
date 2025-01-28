import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { infoNotice } from 'calypso/state/notices/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { AppState } from 'calypso/types';

export const checkForCompletedProfileAndNotify =
	(): ThunkAction< void, AppState, unknown, UnknownAction > => ( dispatch, getState ) => {
		const state = getState();
		const fromReaderOnboarding = getCurrentQueryArguments( state )?.ref === 'reader-onboarding';
		const userSettings = getUserSettings( state );
		const hasCompletedProfile = Boolean(
			userSettings?.has_gravatar &&
				userSettings?.description &&
				userSettings?.first_name &&
				userSettings?.last_name
		);

		if ( fromReaderOnboarding && hasCompletedProfile ) {
			dispatch(
				infoNotice( translate( 'Profile completed!' ), {
					button: translate( 'Return to Reader' ),
					onClick: () => {
						page( '/read' );
					},
				} )
			);
		}
	};
