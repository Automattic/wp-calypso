/**
 * External dependencies
 */
import { get } from 'lodash';

export const isShowingRequestForm = state => get( state, 'login.magicLogin.isShowingRequestForm', false );
export const isShowingInterstitialPage = state => get( state, 'login.magicLogin.isShowingInterstitialPage', false );
export const isShowingExpiredPage = state => get( state, 'login.magicLogin.isShowingExpiredPage', false );
export const isShowingCheckYourEmailPage = state => get( state, 'login.magicLogin.isShowingCheckYourEmailPage', false );

export const isFetchingEmail = state => get( state, 'login.magicLogin.isFetchingEmail', false );
export const requestEmailError = state => get( state, 'login.magicLogin.requestEmailError', null );
export const requestedEmailSuccessfully = state => get( state, 'login.magicLogin.requestedEmailSuccessfully', false );

export const isFetchingAuth = state => get( state, 'login.magicLogin.isFetchingAuth', true );
export const requestAuthError = state => get( state, 'login.magicLogin.requestAuthError', null );
export const requestAuthStatus = state => get( state, 'login.magicLogin.requestAuthStatus', null );

export const emailAddressFormInput = state => get( state, 'login.magicLogin.emailAddressFormInput', '' );
export const emailAddressFormInputIsValid = state => get( state, 'login.magicLogin.emailAddressFormInputIsValid', false );
