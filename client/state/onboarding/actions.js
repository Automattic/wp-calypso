/** @format */

/**
 * Internal dependencies
 */
import { addQueryArgs, trailingslashit } from 'lib/route';
import {
	ONBOARDING_REQUEST,
	ONBOARDING_REQUEST_FAILURE,
	ONBOARDING_REQUEST_SUCCESS,
	ONBOARDING_SET_TOKEN,
	ONBOARDING_SET_URL,
} from 'state/action-types';

export const setOnboardingToken = token => {
	return dispatch => {
		dispatch( {
			type: ONBOARDING_SET_TOKEN,
			token,
		} );
	};
};

export const setOnboardingUrl = url => {
	return dispatch => {
		dispatch( {
			type: ONBOARDING_SET_URL,
			url,
		} );
	};
};

export const sendTestOnboardingRequest = ( data, onSuccess, onError ) => {
	return ( dispatch, getState ) => {
		const state = getState();
		const token = state.onboarding.siteInfo.token;
		const url = trailingslashit( 'http://' + state.onboarding.siteInfo.url.replace( '::', '/' ) );
		const requestUrl = addQueryArgs(
			{
				rest_route: '/jetpack/v4/settings',
			},
			url
		);

		dispatch( {
			type: ONBOARDING_REQUEST,
			data,
		} );

		const request = {
			onboarding: {
				token,
				...data,
			},
		};

		const xhr = new XMLHttpRequest();
		xhr.open( 'POST', requestUrl );
		xhr.setRequestHeader( 'Content-Type', 'application/json' );
		xhr.onreadystatechange = () => {
			if ( xhr.readyState === XMLHttpRequest.DONE ) {
				if ( xhr.status === 200 ) {
					dispatch( {
						type: ONBOARDING_REQUEST_SUCCESS,
					} );

					if ( onSuccess ) {
						onSuccess();
					}
				} else {
					dispatch( {
						type: ONBOARDING_REQUEST_FAILURE,
					} );

					if ( onError ) {
						onError();
					}
				}
			}
		};
		return xhr.send( JSON.stringify( request ) );
	};
};
