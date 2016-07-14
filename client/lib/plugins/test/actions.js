/**
 * External dependencies
 */

import { assert } from 'chai';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import siteData from './fixtures/site';
import mockedWpcom from './mocks/wpcom';

describe( 'WPcom Data Actions', () => {
	let actions;

	useMockery( mockery => {
		mockery.registerMock( 'lib/wp', mockedWpcom );
		mockery.registerMock( 'lib/analytics', { mc: { bumpStat: noop }, tracks: { recordEvent: noop } } );
	} );

	beforeEach( () => {
		actions = require( 'lib/plugins/actions' );
		actions.resetQueue();
		mockedWpcom.undocumented().reset();
	} );

	useFakeDom();

	it( 'Actions should be an object', () => {
		assert.isObject( actions );
	} );

	it( 'Actions should have method installPlugin', () => {
		assert.isFunction( actions.installPlugin );
	} );

	it( 'when installing a plugin, it should send a install request to .com', done => {
		actions.installPlugin( siteData, 'test', noop )
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 1 );
				done();
			} )
			.catch( done );
	} );

	it( 'when installing a plugin, it should send an activate request to .com', done => {
		actions.installPlugin( siteData, 'test', noop )
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsActivateCalls, 1 );
				done();
			} )
			.catch( done );
	} );

	it( 'when installing a plugin, it should not send a request to .com when the site doesn\'t allow us to update its files', () => {
		actions.installPlugin( { canUpdateFiles: false }, 'test', noop );
		assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 0 );
	} );

	it( 'when installing a plugin, it should return a rejected promise if the site files can\'t be updated', done => {
		actions.installPlugin( { canUpdateFiles: false, capabilities: { manage_options: true }, }, 'test', noop )
			.then( () => done( 'Promise should be rejected' ) )
			.catch( () => done() );
	} );

	it( 'when installing a plugin, it should return a rejected promise if user can\'t manage the site', done => {
		actions.installPlugin( { canUpdateFiles: false, capabilities: { manage_options: true }, }, 'test', noop )
			.then( () => done( 'Promise should be rejected' ) )
			.catch( () => done() );
	} );

	it( 'Actions should have method removePlugin', () => {
		assert.isFunction( actions.removePlugin );
	} );

	it( 'when removing a plugin, it should send a remove request to .com', done => {
		actions.removePlugin( {
			canUpdateFiles: true,
			user_can_manage: true,
			capabilities: { manage_options: true },
		}, {}, noop )
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 1 );
				done();
			} )
			.catch( done );
	} );

	it( 'when removing a plugin, it should send an deactivate request to .com', done => {
		actions.removePlugin( {
			canUpdateFiles: true,
			user_can_manage: true,
			capabilities: { manage_options: true },
			jetpack: true
		}, { active: true }, noop )
		.then( () => {
			assert.equal( mockedWpcom.getActivity().pluginsDeactivateCalls, 1 );
			done();
		} )
		.catch( done );
	} );

	it( 'when removing a plugin, it should not send a request to .com when the site doesn\'t allow us to update its files', () => {
		actions.removePlugin( { canUpdateFiles: false }, {}, noop );
		assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 0 );
	} );
} );
