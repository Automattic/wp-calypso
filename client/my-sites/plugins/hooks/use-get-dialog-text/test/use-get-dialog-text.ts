/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useGetDialogText from '..';
import { PluginActions } from '../../types';
import type { Site, Plugin } from '../../types';

const ACTION_HEADING_TEXTS = [
	{ action: PluginActions.ACTIVATE, text: 'Activate' },
	{ action: PluginActions.DEACTIVATE, text: 'Deactivate' },
	{ action: PluginActions.REMOVE, text: 'Deactivate and remove' },
	{ action: PluginActions.UPDATE, text: 'Update' },
	{ action: PluginActions.ENABLE_AUTOUPDATES, text: 'Enable auto-updates for' },
	{ action: PluginActions.DISABLE_AUTOUPDATES, text: 'Disable auto-updates for' },
	// Check cases in which the action isn't something we recognize
	{ action: 'unknown/invalid action name', text: 'Affect' },
	{ action: '', text: 'Affect' },
];

const ACTION_MESSAGE_TEXTS = ACTION_HEADING_TEXTS.map( ( { action, text } ) => ( {
	action,
	text: text.toLocaleLowerCase(),
} ) );

const runHook = () => renderHook( () => useGetDialogText() ).result.current;
const createFakePlugin = (
	slug: string,
	name?: string,
	sites: { ID: number }[] = []
): Plugin => ( {
	slug,
	name,
	sites: sites.reduce( ( acc, next ) => ( { [ next.ID ]: 'value does not matter', ...acc } ), {} ),
} );

const allSites: Site[] = [
	{ ID: 1, title: 'Site 1', canUpdateFiles: true },
	{ ID: 2, title: 'Site 2', canUpdateFiles: true },
	{ ID: 3, title: 'Site 3', canUpdateFiles: false },
	{ ID: 4, title: 'Site 4', canUpdateFiles: false },
	{ ID: 5, title: 'Site 5', canUpdateFiles: false },
];

describe( 'useGetDialogText', () => {
	it( 'only counts sites that are able to update files', () => {
		const getDialogText = runHook();

		// Five sites are available in total
		const testSites = allSites;
		expect( testSites.length ).toEqual( 5 );

		const testPlugin = createFakePlugin( 'test', 'Test Plugin', testSites );

		// Only two are able to update files
		const canUpdateFilesCount = testSites.filter( ( { canUpdateFiles } ) => canUpdateFiles ).length;
		expect( canUpdateFilesCount ).toEqual( 2 );

		// Therefore, we should see a message appropriate to two sites being affected
		const { message } = getDialogText( PluginActions.ACTIVATE, [ testPlugin ], testSites );
		expect( message ).toContain( ` 2 sites` );
	} );

	it( 'only counts sites on which the given plugin(s) are installed', () => {
		const getDialogText = runHook();

		// Two sites are available that can update files
		const testSites = allSites.filter( ( { canUpdateFiles } ) => canUpdateFiles );
		expect( testSites.length ).toEqual( 2 );

		// Only the first test site has this plugin installed
		const testPlugin = createFakePlugin( 'test', 'Test Plugin', [ testSites[ 0 ] ] );

		// Since only one site should be affected, we should see a message
		// appropriate for just one site being affected
		const { message } = getDialogText( PluginActions.ACTIVATE, [ testPlugin ], testSites );
		expect( message ).toContain( ` on ${ testSites[ 0 ].title }.` );
	} );

	it.each( ACTION_HEADING_TEXTS )(
		'gets the correct `$action` heading text for one plugin with a name',
		( { action, text } ) => {
			expect( action ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSites = [ allSites[ 0 ] ];
			const testPlugin = createFakePlugin( 'test1', 'Test Plugin', testSites );

			const { heading } = getDialogText( action, [ testPlugin ], testSites );
			expect( heading ).toEqual( `${ text } plugin` );
		}
	);

	it.each( ACTION_HEADING_TEXTS )(
		'gets the correct `$action` heading text for one plugin with a slug but no name',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSites = [ allSites[ 0 ] ];
			const testPlugin = createFakePlugin( 'test1', undefined, testSites );

			const { heading } = getDialogText( action, [ testPlugin ], testSites );
			expect( heading ).toEqual( `${ text } plugin` );
		}
	);

	it.each( ACTION_HEADING_TEXTS )(
		'gets the correct `$action` heading text for multiple plugins',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSites = [ allSites[ 0 ] ];
			const testPlugins = [ 1, 2, 3 ].map( ( i ) =>
				createFakePlugin( `test${ i }`, `Test Plugin #${ i }`, testSites )
			);

			const { heading } = getDialogText( action, testPlugins, testSites );
			expect( heading ).toEqual( `${ text } ${ testPlugins.length } plugins` );
		}
	);

	it.each( ACTION_MESSAGE_TEXTS )(
		'gets the correct `$action` message text for one plugin with a name, and one site',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSite = allSites[ 0 ];
			const testPlugin = createFakePlugin( 'test1', 'Test Plugin', [ testSite ] );

			const { message } = getDialogText( action, [ testPlugin ], [ testSite ] );
			expect( message ).toEqual(
				`You are about to ${ text } the ${ testPlugin.name } plugin installed on ${ testSite.title }.`
			);
		}
	);

	it.each( ACTION_MESSAGE_TEXTS )(
		'gets the correct `$action` message text for one plugin with a name, and multiple sites',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSites = allSites.slice( 0, 2 );
			const testPlugin = createFakePlugin( 'test1', 'Test Plugin', testSites );

			const { message } = getDialogText( action, [ testPlugin ], testSites );
			expect( message ).toEqual(
				`You are about to ${ text } the ${ testPlugin.name } plugin installed on ${ testSites.length } sites.`
			);
		}
	);

	it.each( ACTION_MESSAGE_TEXTS )(
		'gets the correct `$action` message text for one plugin with a slug but no name, and one site',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSite = allSites[ 0 ];
			const testPlugin = createFakePlugin( 'test1', undefined, [ testSite ] );

			const { message } = getDialogText( action, [ testPlugin ], [ testSite ] );
			expect( message ).toEqual(
				`You are about to ${ text } the ${ testPlugin.slug } plugin installed on ${ testSite.title }.`
			);
		}
	);

	it.each( ACTION_MESSAGE_TEXTS )(
		'gets the correct `$action` message text for one plugin with a slug but no name, and multiple sites',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSites = allSites.slice( 0, 2 );
			const testPlugin = createFakePlugin( 'test1', undefined, testSites );

			const { message } = getDialogText( action, [ testPlugin ], testSites );
			expect( message ).toEqual(
				`You are about to ${ text } the ${ testPlugin.slug } plugin installed on ${ testSites.length } sites.`
			);
		}
	);

	it.each( ACTION_MESSAGE_TEXTS )(
		'gets the correct message text for multiple plugins and one site',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSite = allSites[ 0 ];
			const testPlugins = [ 1, 2, 3 ].map( ( i ) =>
				createFakePlugin( `test${ i }`, `Test Plugin #${ i }`, [ testSite ] )
			);

			const { message } = getDialogText( action, testPlugins, [ testSite ] );
			expect( message ).toEqual(
				`You are about to ${ text } ${ testPlugins.length } plugins installed on ${ testSite.title }.`
			);
		}
	);

	it.each( ACTION_MESSAGE_TEXTS )(
		'gets the correct message text for multiple plugins and multiple sites',
		( { action, text } ) => {
			expect( action.length ).toBeDefined();
			expect( text.length ).toBeGreaterThan( 0 );

			const getDialogText = runHook();

			const testSites = allSites.slice( 0, 2 );
			const testPlugins = [ 1, 2, 3 ].map( ( i ) =>
				createFakePlugin( `test${ i }`, `Test Plugin #${ i }`, testSites )
			);

			const { message } = getDialogText( action, testPlugins, testSites );
			expect( message ).toEqual(
				`You are about to ${ text } ${ testPlugins.length } plugins. This will impact ${ testSites.length } sites.`
			);
		}
	);
} );
