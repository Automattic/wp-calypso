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
 * @param {Object} siteOptions Site options, as served inside `intial_state`.
 */
function mockSiteOptions( siteOptions ) {
	optionalConfig.mockImplementation( ( key ) =>
		key === 'intial_state'
			? { sites: { items: { [ SITE_ID ]: { options: siteOptions } } } }
			: undefined
	);
}

function renderModules() {
	return render( <Modules siteId={ SITE_ID } adminBaseUrl="https://example.com/wp-admin/" /> );
}

describe( 'Modules', () => {
	afterEach( () => optionalConfig.mockReset() );

	it( 'hides the cards on a site without the Jetpack plugin, whose routes they would 404 on', () => {
		mockSiteOptions( { jetpack_version: '' } );
		const { container } = renderModules();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'shows the cards on a site with the Jetpack plugin', () => {
		mockSiteOptions( { jetpack_version: '15.1' } );
		renderModules();
		expect( screen.getByText( 'Blocked login attempts' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Blocked spam comments' ) ).toBeInTheDocument();
	} );
} );
