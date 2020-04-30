/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import siteData from './fixtures/site';
import mockedWpcom from './mocks/wpcom';
import actions from 'lib/plugins/actions';

jest.mock( 'lib/wp', () => require( './mocks/wpcom' ) );
jest.mock( 'lib/analytics/tracks', () => ( {
	recordTracksEvent: () => {},
} ) );

describe( 'WPcom Data Actions', () => {
	beforeEach( () => {
		actions.resetQueue();
		mockedWpcom.undocumented().reset();
	} );

	test( 'Actions should be an object', () => {
		assert.isObject( actions );
	} );

	test( 'Actions should have method installPlugin', () => {
		assert.isFunction( actions.installPlugin );
	} );

	test( 'when installing a plugin, it should send a install request to .com', () => {
		return actions.installPlugin( siteData, 'test', noop ).then( () => {
			assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 1 );
		} );
	} );

	test( 'when installing a plugin, it should send an activate request to .com', () => {
		return actions.installPlugin( siteData, 'test', noop ).then( () => {
			assert.equal( mockedWpcom.getActivity().pluginsActivateCalls, 1 );
		} );
	} );

	test( "when installing a plugin, it should not send a request to .com when the site doesn't allow us to update its files", () => {
		return actions.installPlugin( { canUpdateFiles: false }, 'test', noop ).catch( ( error ) => {
			assert.equal( error, "Error: Can't update files on the site" );
			assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 0 );
		} );
	} );

	test( "when installing a plugin, it should return a rejected promise if the site files can't be updated", () => {
		return actions
			.installPlugin(
				{ canUpdateFiles: false, capabilities: { manage_options: true } },
				'test',
				noop
			)
			.catch( ( error ) => assert.equal( error, "Error: Can't update files on the site" ) );
	} );

	test( "when installing a plugin, it should return a rejected promise if user can't manage the site", () => {
		return actions
			.installPlugin(
				{ canUpdateFiles: false, capabilities: { manage_options: true } },
				'test',
				noop
			)
			.catch( ( error ) => assert.equal( error, "Error: Can't update files on the site" ) );
	} );

	test( 'Actions should have method removePlugin', () => {
		assert.isFunction( actions.removePlugin );
	} );

	test( 'when removing a plugin, it should send a remove request to .com', () => {
		return actions
			.removePlugin(
				{
					canUpdateFiles: true,
					user_can_manage: true,
					capabilities: { manage_options: true },
				},
				{},
				noop
			)
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 1 );
			} );
	} );

	test( 'when removing a plugin, it should send an deactivate request to .com', () => {
		return actions
			.removePlugin(
				{
					canUpdateFiles: true,
					user_can_manage: true,
					capabilities: { manage_options: true },
					jetpack: true,
				},
				{ active: true },
				noop
			)
			.then( () => {
				assert.equal( mockedWpcom.getActivity().pluginsDeactivateCalls, 1 );
			} );
	} );

	test( "when removing a plugin, it should not send a request to .com when the site doesn't allow us to update its files", () => {
		actions.removePlugin( { canUpdateFiles: false }, {}, noop );
		assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 0 );
	} );
} );
