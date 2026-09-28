/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { optionalConfig } from '../../lib/config-api';
import Modules from '../modules';

jest.mock( '../../lib/config-api', () => {
	const config = jest.fn();
	config.isEnabled = ( feature ) => feature === 'is_running_in_jetpack_site';
	return { __esModule: true, default: config, optionalConfig: jest.fn() };
} );
jest.mock( '../../hooks/use-module-data-query', () => () => ( {
	data: 0,
	isLoading: false,
	isError: false,
	error: null,
	refetch: jest.fn(),
} ) );
jest.mock( '../../lib/selectors/can-current-user', () => () => true );

const SITE_ID = 123;

/**
 * @param {Object} values Config values, as printed by stats-admin.
 */
function mockConfigValues( values ) {
	optionalConfig.mockImplementation( ( key ) => values[ key ] );
}

function renderModules() {
	return render( <Modules siteId={ SITE_ID } adminBaseUrl="https://example.com/wp-admin/" /> );
}

describe( 'Modules', () => {
	afterEach( () => optionalConfig.mockReset() );

	it( 'hides the cards on a site without the Jetpack plugin, whose routes they would 404 on', () => {
		mockConfigValues( { jetpack_version: '' } );
		const { container } = renderModules();
		expect( container ).toBeEmptyDOMElement();
	} );

	it.each( [
		[ 'the Jetpack plugin is active', { jetpack_version: '15.1' } ],
		[ 'a stats-admin release older than the key omits it', {} ],
	] )( 'shows the cards when %s', ( _, values ) => {
		mockConfigValues( values );
		renderModules();
		expect( screen.getByText( 'Blocked login attempts' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Blocked spam comments' ) ).toBeInTheDocument();
	} );
} );
