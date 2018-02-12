/** @format */

/**
 * Internal dependencies
 */
import { handleError, handleResponse, installJetpackPlugin } from '../';
import {
	updateJetpackRemoteInstallError,
	jetpackRemoteInstallComplete,
} from 'state/jetpack-remote-install/actions';

const url = 'https://example.com';
const user = 'blah123';
const password = 'hGhrskf145kst';

const SUCCESS_RESPONSE = { status: true };
const FAILURE_RESPONSE = {
	status: false,
	error: 'COULD_NOT_LOGIN',
};

describe( 'installJetpackPlugin', () => {
	test( 'should dispatch an http request', () => {
		const dispatch = jest.fn();
		installJetpackPlugin( { dispatch }, { url, user, password } );
		expect( dispatch ).toMatchSnapshot();
	} );
} );

describe( 'handleResponse', () => {
	test( 'should dispatch jetpackRemoteInstallComplete on success', () => {
		const dispatch = jest.fn();
		handleResponse( { dispatch }, { url }, SUCCESS_RESPONSE );
		expect( dispatch ).toHaveBeenCalledWith( jetpackRemoteInstallComplete( url ) );
	} );

	test( 'should dispatch updateRemoteInstallError on failure', () => {
		const dispatch = jest.fn();
		handleResponse( { dispatch }, { url }, FAILURE_RESPONSE );
		expect( dispatch ).toHaveBeenCalledWith(
			updateJetpackRemoteInstallError( url, 'COULD_NOT_LOGIN' )
		);
	} );
} );

describe( 'handleError', () => {
	test( 'should dispatch updateJetpackRemoteInstallError', () => {
		const dispatch = jest.fn();
		handleError( { dispatch }, { url } );
		expect( dispatch ).toHaveBeenCalledWith( updateJetpackRemoteInstallError( url, 'API_ERROR' ) );
	} );
} );
