/** @format */

/**
 * Internal dependencies
 */
import { handleResponse, installJetpackPlugin } from '../';
import {
	jetpackRemoteInstallComplete,
	jetpackRemoteInstallUpdateError,
} from 'state/jetpack-remote-install/actions';

const url = 'https://yourgroovydomain.com';
const user = 'blah123';
const password = 'hGhrskf145kst';

const SUCCESS_RESPONSE = { status: true };
const FAILURE_RESPONSE = {
	status: false,
	error: {
		code: 'COULD_NOT_LOGIN',
		message: 'extra info',
	},
};

describe( 'installJetpackPlugin', () => {
	test( 'should return an http request', () => {
		const result = installJetpackPlugin( { url, user, password } );
		expect( result ).toMatchSnapshot();
	} );
} );

describe( 'handleResponse', () => {
	test( 'should return jetpackRemoteInstallComplete on success', () => {
		const result = handleResponse( { url }, SUCCESS_RESPONSE );
		expect( result ).toEqual( jetpackRemoteInstallComplete( url ) );
	} );

	test( 'should return JetpackRemoteInstallUpdateError on failure', () => {
		const result = handleResponse( { url }, FAILURE_RESPONSE );
		expect( result ).toEqual(
			jetpackRemoteInstallUpdateError( url, 'COULD_NOT_LOGIN', 'extra info' )
		);
	} );
} );
