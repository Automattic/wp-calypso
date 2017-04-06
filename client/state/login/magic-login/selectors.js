/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
	REQUEST_FORM,
} from './constants';

export const showingView = state => get( state, 'login.magicLogin.showingView', null );
export const isShowingCheckYourEmailPage = state => showingView( state ) === CHECK_YOUR_EMAIL_PAGE;
export const isShowingInterstitialPage = state => showingView( state ) === INTERSTITIAL_PAGE;
export const isShowingExpiredPage = state => showingView( state ) === LINK_EXPIRED_PAGE;
export const isShowingRequestForm = state => showingView( state ) === REQUEST_FORM;

export const isFetchingEmail = state => get( state, 'login.magicLogin.isFetchingEmail', false );
export const requestEmailError = state => get( state, 'login.magicLogin.requestEmailError', null );
export const requestedEmailSuccessfully = state => get( state, 'login.magicLogin.requestedEmailSuccessfully', false );

export const isFetchingAuth = state => get( state, 'login.magicLogin.isFetchingAuth', true );
export const requestAuthError = state => get( state, 'login.magicLogin.requestAuthError', null );
export const requestAuthStatus = state => get( state, 'login.magicLogin.requestAuthStatus', null );

export const emailAddressFormInput = state => get( state, 'login.magicLogin.emailAddressFormInput', '' );
export const emailAddressFormInputIsValid = state => get( state, 'login.magicLogin.emailAddressFormInputIsValid', false );
