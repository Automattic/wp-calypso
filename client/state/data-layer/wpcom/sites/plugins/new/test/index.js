/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	uploadComplete,
} from '../';
import {
	completePluginUpload,
} from 'state/plugins/upload/actions';
import { PLUGIN_INSTALL_REQUEST_SUCCESS } from 'state/action-types';

const siteId = 77203074;
const pluginId = 'hello-dolly/hello';

const SUCCESS_RESPONSE = deepFreeze( {
	active: false,
	author: 'blah',
	author_url: 'http://example.com',
	autoupdate: false,
	description: 'blah blah blah',
	id: 'hello-dolly/hello',
	name: 'Hello Dolly',
	network: false,
	plugin_url: 'http://wordpress.org/extend/plugins/hello-dolly/',
	slug: 'hello-dolly',
	version: '1.6',
} );

describe( 'uploadComplete', () => {
	it( 'should dispatch plugin upload complete action', () => {
		const dispatch = sinon.spy();
		uploadComplete( { dispatch }, { siteId }, null, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			completePluginUpload( siteId, pluginId )
		);
	} );

	it( 'should dispath plugin install request success', () => {
		const dispatch = sinon.spy();
		uploadComplete( { dispatch }, { siteId }, null, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith( {
			type: PLUGIN_INSTALL_REQUEST_SUCCESS,
			siteId,
			pluginId,
			data: SUCCESS_RESPONSE,
		} );
	} );
} );

