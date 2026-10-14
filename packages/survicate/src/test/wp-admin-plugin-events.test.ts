/**
 * @jest-environment jsdom
 */

jest.mock( '../invoke-event', () => ( {
	invokeSurvicateEvent: jest.fn(),
} ) );

import { invokeSurvicateEvent } from '../invoke-event';
import { observeWpAdminPluginEvents } from '../wp-admin-plugin-events';

const mockInvokeSurvicateEvent = invokeSurvicateEvent as jest.Mock;

type Handler = () => void;

// jsdom implements no navigation timing entries.
function setNavigationEntries( entries: Partial< PerformanceEntry >[] ) {
	Object.defineProperty( performance, 'getEntriesByType', {
		configurable: true,
		value: () => entries,
	} );
}

function setLoadedUrl( url: string ) {
	setNavigationEntries( [ { name: url } ] );
}

function installJQuery() {
	const handlers: Record< string, Handler[] > = {};
	( window as Window & { jQuery?: unknown } ).jQuery = () => ( {
		on: ( event: string, handler: Handler ) => {
			( handlers[ event ] ??= [] ).push( handler );
		},
	} );
	return ( event: string ) => handlers[ event ]?.forEach( ( handler ) => handler() );
}

describe( 'observeWpAdminPluginEvents', () => {
	afterEach( () => {
		jest.restoreAllMocks();
		delete ( performance as Partial< Performance > ).getEntriesByType;
		mockInvokeSurvicateEvent.mockReset();
		delete ( window as Window & { jQuery?: unknown } ).jQuery;
		document.body.innerHTML = '';
	} );

	test.each( [
		[ 'activate=true', 'pluginActivated' ],
		[ 'activate-multi=true', 'pluginActivated' ],
		[ 'deactivate=true', 'pluginDeactivated' ],
		[ 'deactivate-multi=true', 'pluginDeactivated' ],
	] )( 'fires on plugins.php?%s as %s', ( query, eventName ) => {
		setLoadedUrl( `https://example.com/wp-admin/plugins.php?${ query }&plugin_status=all` );

		observeWpAdminPluginEvents();

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( eventName );
	} );

	test( 'does not fire on a plain plugins.php load', () => {
		setLoadedUrl( 'https://example.com/wp-admin/plugins.php?plugin_status=all' );

		observeWpAdminPluginEvents();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'ignores the same query args on other screens', () => {
		setLoadedUrl( 'https://example.com/wp-admin/themes.php?activated=true&activate=true' );

		observeWpAdminPluginEvents();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'fires pluginUpdated once update-core.php finishes running the selected updates', () => {
		setLoadedUrl( 'https://example.com/wp-admin/update-core.php?action=do-plugin-upgrade' );
		document.body.innerHTML =
			'<iframe src="update.php?action=update-selected&amp;plugins=hello.php"></iframe>';

		observeWpAdminPluginEvents();
		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();

		document.querySelector( 'iframe' )?.dispatchEvent( new Event( 'load' ) );
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( 'pluginUpdated' );
	} );

	test.each( [
		[ 'wp-plugin-update-success', 'pluginUpdated' ],
		[ 'wp-plugin-activate-success', 'pluginActivated' ],
	] )( 'fires on the %s wp.updates event as %s', ( jQueryEvent, eventName ) => {
		setLoadedUrl( 'https://example.com/wp-admin/plugin-install.php' );
		const trigger = installJQuery();

		observeWpAdminPluginEvents();
		trigger( jQueryEvent );

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( eventName );
	} );

	test( 'fires each event at most once per page', () => {
		setLoadedUrl( 'https://example.com/wp-admin/plugins.php' );
		const trigger = installJQuery();

		observeWpAdminPluginEvents();
		trigger( 'wp-plugin-update-success' );
		trigger( 'wp-plugin-update-success' );
		trigger( 'wp-plugin-update-success' );

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does nothing inside an iframe', () => {
		setLoadedUrl( 'https://example.com/wp-admin/plugins.php?activate=true' );
		jest.spyOn( window, 'top', 'get' ).mockReturnValue( {} as Window );

		observeWpAdminPluginEvents();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'falls back to the current URL without a navigation entry', () => {
		setNavigationEntries( [] );
		window.history.replaceState( null, '', '/wp-admin/plugins.php?deactivate=true' );

		observeWpAdminPluginEvents();

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( 'pluginDeactivated' );
		window.history.replaceState( null, '', '/' );
	} );
} );
