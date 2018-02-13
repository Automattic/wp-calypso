/** @format */

/**
 * Internal dependencies
 */
import { handleError, handleResponse, installJetpackPlugin } from '../';
import {
	updateJetpackRemoteInstallError,
	jetpackRemoteInstallComplete,
} from 'state/jetpack-remote-install/actions';

const url = 'https://yourgroovydomain.com';
const user = 'blah123';
const password = 'hGhrskf145kst';

const SUCCESS_RESPONSE = { status: true };
const FAILURE_RESPONSE = {
	status: false,
	error: 'COULD_NOT_LOGIN',
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

	test( 'should return updateRemoteInstallError on failure', () => {
		const result = handleResponse( { url }, FAILURE_RESPONSE );
		expect( result ).toEqual( updateJetpackRemoteInstallError( url, 'COULD_NOT_LOGIN' ) );
	} );
} );

describe( 'handleError', () => {
	test( 'should return updateJetpackRemoteInstallError', () => {
		const result = handleError( { url } );
		expect( result ).toEqual( updateJetpackRemoteInstallError( url, 'API_ERROR' ) );
	} );
} );
