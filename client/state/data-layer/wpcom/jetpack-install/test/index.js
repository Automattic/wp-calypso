/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { installJetpackPlugin } from '../';

const url = 'https://example.com';
const user = 'blah123';
const password = 'hGhrskf145kst';

describe( 'installJetpackPlugin', () => {
	test( 'should dispatch an http request', () => {
		const dispatch = sinon.spy();
		installJetpackPlugin( { dispatch }, { url, user, password } );
		expect( dispatch ).to.have.been.calledWithMatch( {
			query: { user, password },
			method: 'POST',
			path: `/jetpack-install/${ url }`,
		} );
	} );
} );
