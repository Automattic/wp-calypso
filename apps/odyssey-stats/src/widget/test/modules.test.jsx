/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import useModuleDataQuery from '../../hooks/use-module-data-query';
import { optionalConfig } from '../../lib/config-api';
import canCurrentUser from '../../lib/selectors/can-current-user';
import Modules from '../modules';

jest.mock( '../../lib/config-api', () => {
	const config = jest.fn();
	config.isEnabled = ( feature ) => feature === 'is_running_in_jetpack_site';
	return { __esModule: true, default: config, optionalConfig: jest.fn() };
} );
jest.mock( '../../hooks/use-module-data-query' );
jest.mock( '../../lib/selectors/can-current-user' );

const SITE_ID = 123;

/**
 * @param {Object} values Config values, as printed by stats-admin.
 */
function mockConfigValues( values ) {
	optionalConfig.mockImplementation( ( key ) => values[ key ] );
}

/**
 * @param {Object} states         What each module's query returns: `{ data }` or `{ error }`.
 * @param {Object} states.protect Protect's state.
 * @param {Object} states.akismet Akismet's state.
 */
const moduleStates = ( { protect, akismet } ) => {
	useModuleDataQuery.mockImplementation( ( module ) => {
		const state = module === 'protect' ? protect : akismet;
		return {
			data: state.data,
			isLoading: false,
			isError: !! state.error,
			error: state.error ? new Error( state.error ) : null,
			refetch: jest.fn(),
		};
	} );
};

const ok = ( data ) => ( { data } );
const failed = ( error = 'not_active' ) => ( { error } );

function renderModules() {
	return render( <Modules siteId={ SITE_ID } adminBaseUrl="https://example.com/wp-admin/" /> );
}

describe( 'Modules', () => {
	beforeEach( () => {
		window.matchMedia = jest.fn().mockReturnValue( { matches: true } );
		mockConfigValues( { jetpack_version: '15.1' } );
		canCurrentUser.mockReturnValue( true );
		moduleStates( { protect: ok( 12345 ), akismet: ok( 9520 ) } );
	} );

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

	describe( 'for a user who cannot manage modules', () => {
		beforeEach( () => canCurrentUser.mockReturnValue( false ) );

		it( 'hides a failed metric rather than showing it as zero', () => {
			moduleStates( { protect: ok( 12345 ), akismet: failed() } );
			renderModules();

			expect( screen.getByText( 'Blocked login attempts' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Blocked spam comments' ) ).not.toBeInTheDocument();
		} );

		it( 'hides the Anti-spam link along with the Akismet metric', () => {
			moduleStates( { protect: ok( 12345 ), akismet: failed() } );
			renderModules();

			expect(
				screen.queryByRole( 'link', { name: 'Anti-spam insights' } )
			).not.toBeInTheDocument();
		} );

		it( 'hides the whole section when neither metric can be shown', () => {
			moduleStates( { protect: failed(), akismet: failed() } );
			const { container } = renderModules();

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'shows both metrics and the link when the data loads', () => {
			renderModules();

			expect( screen.getByText( 'Blocked login attempts' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Blocked spam comments' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Anti-spam insights' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'for a user who can manage modules', () => {
		it( 'keeps a failed metric, so they can activate it', () => {
			moduleStates( { protect: ok( 12345 ), akismet: failed( 'not_installed' ) } );
			renderModules();

			expect( screen.getByText( 'Blocked spam comments' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Install' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Anti-spam insights' } ) ).toBeInTheDocument();
		} );
	} );
} );
