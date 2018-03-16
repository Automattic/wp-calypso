/** @format */

/**
 * Internal dependencies
 */
import { handleError, handleSuccess, installJetpackPlugin } from '../';
import {
	jetpackRemoteInstallComplete,
	jetpackRemoteInstallUpdateError,
} from 'state/jetpack-remote-install/actions';

const url = 'https://yourgroovydomain.com';
const user = 'blah123';
const password = 'hGhrskf145kst';

const SUCCESS_RESPONSE = { status: true };
const FAILURE_RESPONSE = {
	error: 'COULD_NOT_LOGIN',
	message: 'extra info',
};

describe( 'installJetpackPlugin', () => {
	test( 'should return an http request', () => {
		const result = installJetpackPlugin( { url, user, password } );
		expect( result ).toMatchSnapshot();
	} );
} );

describe( 'handleSuccess', () => {
	test( 'should return jetpackRemoteInstallComplete', () => {
		const result = handleSuccess( { url }, SUCCESS_RESPONSE );
		expect( result ).toEqual( jetpackRemoteInstallComplete( url ) );
	} );
} );

describe( 'handleError', () => {
	test( 'should return JetpackRemoteInstallUpdateError', () => {
		const result = handleError( { url }, FAILURE_RESPONSE );
		expect( result ).toEqual(
			expect.objectContaining(
				jetpackRemoteInstallUpdateError( url, 'COULD_NOT_LOGIN', 'extra info' )
			)
		);
	} );
} );
