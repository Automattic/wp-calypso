/** @jest-environment jsdom */
jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'lib/wp', () => require( './mocks/wpcom' ) );
jest.mock( 'lib/analytics', () => ( {
	mc: { bumpStat: () => {} },
	tracks: { recordEvent: () => {} }
} ) );

/**
 * External dependencies
 */

import { assert } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import actions from 'lib/plugins/actions';
import siteData from './fixtures/site';
import mockedWpcom from './mocks/wpcom';

describe( 'WPcom Data Actions', () => {
	beforeEach( () => {
		actions.resetQueue();
		mockedWpcom.undocumented().reset();
	} );

	it( 'Actions should be an object', () => {
		assert.isObject( actions );
	} );

	it( 'Actions should have method installPlugin', () => {
		assert.isFunction( actions.installPlugin );
	} );

	it( 'when installing a plugin, it should send a install request to .com', () => {
		return actions.installPlugin( siteData, 'test', noop )
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 1 );
			} );
	} );

	it( 'when installing a plugin, it should send an activate request to .com', () => {
		return actions.installPlugin( siteData, 'test', noop )
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsActivateCalls, 1 );
			} );
	} );

	it( 'when installing a plugin, it should not send a request to .com when the site doesn\'t allow us to update its files', () => {
		return actions.installPlugin( { canUpdateFiles: false }, 'test', noop )
			.catch( error => {
				assert.equal( error, 'Error: Can\'t update files on the site' );
				assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 0 );
			} );
	} );

	it( 'when installing a plugin, it should return a rejected promise if the site files can\'t be updated', () => {
		return actions.installPlugin( { canUpdateFiles: false, capabilities: { manage_options: true }, }, 'test', noop )
			.catch( error => assert.equal( error, 'Error: Can\'t update files on the site' ) );
	} );

	it( 'when installing a plugin, it should return a rejected promise if user can\'t manage the site', () => {
		return actions.installPlugin( { canUpdateFiles: false, capabilities: { manage_options: true }, }, 'test', noop )
			.catch( error => assert.equal( error, 'Error: Can\'t update files on the site' ) );
	} );

	it( 'Actions should have method removePlugin', () => {
		assert.isFunction( actions.removePlugin );
	} );

	it( 'when removing a plugin, it should send a remove request to .com', () => {
		return actions.removePlugin( {
			canUpdateFiles: true,
			user_can_manage: true,
			capabilities: { manage_options: true },
		}, {}, noop )
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 1 );
			} );
	} );

	it( 'when removing a plugin, it should send an deactivate request to .com', () => {
		return actions.removePlugin( {
			canUpdateFiles: true,
			user_can_manage: true,
			capabilities: { manage_options: true },
			jetpack: true
		}, { active: true }, noop )
		.then( () => {
			assert.equal( mockedWpcom.getActivity().pluginsDeactivateCalls, 1 );
		} );
	} );

	it( 'when removing a plugin, it should not send a request to .com when the site doesn\'t allow us to update its files', () => {
		actions.removePlugin( { canUpdateFiles: false }, {}, noop );
		assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 0 );
	} );
} );
