/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	//MAGIC_LOGIN_HANDLE_AUTH_TOKEN_FETCH,
	//MAGIC_LOGIN_HANDLE_AUTH_TOKEN_RECEIVE,
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_SHOW_REQUEST_FORM,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	SERIALIZE,
} from 'state/action-types';

import reducer, {
	emailAddressFormInput,
	emailAddressFormInputIsValid,
	isFetchingEmail,
	isShowingCheckYourEmailPage,
	isShowingExpiredPage,
	isShowingInterstitialPage,
	isShowingRequestForm,
	//requestAuthError,
	//requestAuthSuccess,
	requestEmailError,
	requestedEmailSuccessfully,
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'emailAddressFormInput',
			'emailAddressFormInputIsValid',
			'isFetchingEmail',
			'isShowingCheckYourEmailPage',
			'isShowingExpiredPage',
			'isShowingInterstitialPage',
			'isShowingRequestForm',
			'requestAuthError',
			'requestAuthSuccess',
			'requestEmailError',
			'requestedEmailSuccessfully',
		] );
	} );

	describe( 'emailAddressFormInput', () => {
		it( 'should default to an empty string', () => {
			const state = emailAddressFormInput( undefined, {} );

			expect( state ).to.equal( '' );
		} );

		it( 'should be an empty string on DESERIALIZE', () => {
			const state = emailAddressFormInput( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.equal( '' );
		} );

		it( 'should be an empty string on SERIALIZE', () => {
			const state = emailAddressFormInput( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.equal( '' );
		} );

		it( 'should set emailAddressFormInput to string value on action', () => {
			const state = emailAddressFormInput( undefined, {
				type: MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
				email: 'claudemonet@example.com',
			} );

			expect( state ).to.equal( 'claudemonet@example.com' );
		} );

		it( 'should set emailAddressFormInput to empty string when clearing', () => {
			const state = emailAddressFormInput( undefined, {
				type: MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
				email: '',
			} );

			expect( state ).to.equal( '' );
		} );
	} );

	describe( 'emailAddressFormInputIsValid', () => {
		it( 'should default to false', () => {
			const state = emailAddressFormInputIsValid( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on DESERIALIZE', () => {
			const state = emailAddressFormInputIsValid( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on SERIALIZE', () => {
			const state = emailAddressFormInputIsValid( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on invalid email address', () => {
			const state = emailAddressFormInputIsValid( undefined, {
				type: MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
				email: '',
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be true on invalid email address', () => {
			const state = emailAddressFormInputIsValid( undefined, {
				type: MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
				email: 'claudemonet@example.com',
			} );
			expect( state ).to.be.true;
		} );
	} );

	describe( 'isFetchingEmail', () => {
		it( 'should default to false', () => {
			const state = isFetchingEmail( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on DESERIALIZE', () => {
			const state = isFetchingEmail( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on SERIALIZE', () => {
			const state = isFetchingEmail( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be true on fetch', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).to.be.true;
		} );

		it( 'should be false on error', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on success', () => {
			const state = isFetchingEmail( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).to.be.false;
		} );
	} );

	describe( 'requestEmailError', () => {
		it( 'should default to null', () => {
			const state = requestEmailError( undefined, {} );
			expect( state ).to.be.null;
		} );

		it( 'should be null on DESERIALIZE', () => {
			const state = requestEmailError( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should be null on SERIALIZE', () => {
			const state = requestEmailError( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should be null on fetch', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).to.be.null;
		} );

		it( 'should be error on error', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
				error: 'foo bar',
			} );
			expect( state ).to.equal( 'foo bar' );
		} );

		it( 'should be null on success', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).to.be.null;
		} );

		it( 'should be null on hide request notice', () => {
			const state = requestEmailError( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
			} );
			expect( state ).to.be.null;
		} );
	} );

	describe( 'requestedEmailSuccessfully', () => {
		it( 'should default to false', () => {
			const state = requestedEmailSuccessfully( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on DESERIALIZE', () => {
			const state = requestedEmailSuccessfully( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on SERIALIZE', () => {
			const state = requestedEmailSuccessfully( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on fetch action', () => {
			const state = requestedEmailSuccessfully( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on error', () => {
			const state = requestedEmailSuccessfully( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be true on success', () => {
			const state = requestedEmailSuccessfully( undefined, {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
			} );
			expect( state ).to.be.true;
		} );
	} );

	describe( 'isShowingCheckYourEmailPage', () => {
		it( 'should default to false', () => {
			const state = isShowingCheckYourEmailPage( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on DESERIALIZE', () => {
			const state = isShowingCheckYourEmailPage( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on SERIALIZE', () => {
			const state = isShowingCheckYourEmailPage( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be true on show check email', () => {
			const state = isShowingCheckYourEmailPage( undefined, {
				type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
			} );
			expect( state ).to.be.true;
		} );

		it( 'should be false on show interstitial', () => {
			const state = isShowingCheckYourEmailPage( undefined, {
				type: MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on hide request form', () => {
			const state = isShowingCheckYourEmailPage( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on show expired', () => {
			const state = isShowingCheckYourEmailPage( undefined, {
				type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on show request form', () => {
			const state = isShowingCheckYourEmailPage( undefined, {
				type: MAGIC_LOGIN_SHOW_REQUEST_FORM,
			} );
			expect( state ).to.be.false;
		} );
	} );

	describe( 'isShowingExpiredPage', () => {
		it( 'should default to false', () => {
			const state = isShowingExpiredPage( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on DESERIALIZE', () => {
			const state = isShowingExpiredPage( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on SERIALIZE', () => {
			const state = isShowingExpiredPage( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on show check email', () => {
			const state = isShowingExpiredPage( undefined, {
				type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on show interstitial', () => {
			const state = isShowingExpiredPage( undefined, {
				type: MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be true on show expired', () => {
			const state = isShowingExpiredPage( undefined, {
				type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
			} );
			expect( state ).to.be.true;
		} );

		it( 'should be false on show request form', () => {
			const state = isShowingExpiredPage( undefined, {
				type: MAGIC_LOGIN_SHOW_REQUEST_FORM,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on hide request form', () => {
			const state = isShowingExpiredPage( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
			} );
			expect( state ).to.be.false;
		} );
	} );

	describe( 'isShowingInterstitialPage', () => {
		it( 'should default to false', () => {
			const state = isShowingInterstitialPage( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on DESERIALIZE', () => {
			const state = isShowingInterstitialPage( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on SERIALIZE', () => {
			const state = isShowingInterstitialPage( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on show check email', () => {
			const state = isShowingInterstitialPage( undefined, {
				type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be true on show interstitial', () => {
			const state = isShowingInterstitialPage( undefined, {
				type: MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
			} );
			expect( state ).to.be.true;
		} );

		it( 'should be false on show expired', () => {
			const state = isShowingInterstitialPage( undefined, {
				type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on show request form', () => {
			const state = isShowingInterstitialPage( undefined, {
				type: MAGIC_LOGIN_SHOW_REQUEST_FORM,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on hide request form', () => {
			const state = isShowingInterstitialPage( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
			} );
			expect( state ).to.be.false;
		} );
	} );

	describe( 'isShowingRequestForm', () => {
		it( 'should default to false', () => {
			const state = isShowingRequestForm( undefined, {} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on DESERIALIZE', () => {
			const state = isShowingRequestForm( undefined, {
				type: DESERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on SERIALIZE', () => {
			const state = isShowingRequestForm( undefined, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should be false on show check email', () => {
			const state = isShowingRequestForm( undefined, {
				type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on show interstitial', () => {
			const state = isShowingRequestForm( undefined, {
				type: MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be false on show expired', () => {
			const state = isShowingRequestForm( undefined, {
				type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
			} );
			expect( state ).to.be.false;
		} );

		it( 'should be true on show request form', () => {
			const state = isShowingRequestForm( undefined, {
				type: MAGIC_LOGIN_SHOW_REQUEST_FORM,
			} );
			expect( state ).to.be.true;
		} );

		it( 'should be false on hide request form', () => {
			const state = isShowingRequestForm( undefined, {
				type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
			} );
			expect( state ).to.be.false;
		} );
	} );
} );
