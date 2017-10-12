/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import siteData from './fixtures/site';
import mockedWpcom from './mocks/wpcom';
import actions from 'lib/plugins/actions';

jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'lib/wp', () => require( './mocks/wpcom' ) );
jest.mock( 'lib/analytics', () => ( {
	mc: { bumpStat: () => {} },
	tracks: { recordEvent: () => {} },
} ) );

describe( 'WPcom Data Actions', () => {
	beforeEach( () => {
		actions.resetQueue();
		mockedWpcom.undocumented().reset();
	} );

	test( 'Actions should be an object', () => {
		expect( typeof actions ).toBe( 'object' );
	} );

	test( 'Actions should have method installPlugin', () => {
		expect( typeof actions.installPlugin ).toBe( 'function' );
	} );

	test( 'when installing a plugin, it should send a install request to .com', () => {
		return actions.installPlugin( siteData, 'test', noop ).then( () => {
			expect( mockedWpcom.getActivity().pluginsInstallCalls ).toEqual( 1 );
		} );
	} );

	test( 'when installing a plugin, it should send an activate request to .com', () => {
		return actions.installPlugin( siteData, 'test', noop ).then( () => {
			expect( mockedWpcom.getActivity().pluginsActivateCalls ).toEqual( 1 );
		} );
	} );

	test( "when installing a plugin, it should not send a request to .com when the site doesn't allow us to update its files", () => {
		return actions.installPlugin( { canUpdateFiles: false }, 'test', noop ).catch( error => {
			expect( error ).toEqual( "Error: Can't update files on the site" );
			expect( mockedWpcom.getActivity().pluginsInstallCalls ).toEqual( 0 );
		} );
	} );

	test( "when installing a plugin, it should return a rejected promise if the site files can't be updated", () => {
		return actions
			.installPlugin(
				{ canUpdateFiles: false, capabilities: { manage_options: true } },
				'test',
				noop
			)
			.catch( error => expect( error ).toEqual( "Error: Can't update files on the site" ) );
	} );

	test( "when installing a plugin, it should return a rejected promise if user can't manage the site", () => {
		return actions
			.installPlugin(
				{ canUpdateFiles: false, capabilities: { manage_options: true } },
				'test',
				noop
			)
			.catch( error => expect( error ).toEqual( "Error: Can't update files on the site" ) );
	} );

	test( 'Actions should have method removePlugin', () => {
		expect( typeof actions.removePlugin ).toBe( 'function' );
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
				expect( mockedWpcom.getActivity().pluginsRemoveCalls ).toEqual( 1 );
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
				expect( mockedWpcom.getActivity().pluginsDeactivateCalls ).toEqual( 1 );
			} );
	} );

	test( "when removing a plugin, it should not send a request to .com when the site doesn't allow us to update its files", () => {
		actions.removePlugin( { canUpdateFiles: false }, {}, noop );
		expect( mockedWpcom.getActivity().pluginsRemoveCalls ).toEqual( 0 );
	} );
} );
