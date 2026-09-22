/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import useModuleDataQuery from '../../hooks/use-module-data-query';
import canCurrentUser from '../../lib/selectors/can-current-user';
import Modules from '../modules';

jest.mock( '@automattic/calypso-config', () => {
	// The widget only asks whether it is running in a Jetpack site, which it always is here.
	const config = () => undefined;
	config.isEnabled = () => true;
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );
jest.mock( '../../hooks/use-module-data-query' );
jest.mock( '../../lib/selectors/can-current-user' );

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

describe( 'Modules', () => {
	beforeEach( () => {
		window.matchMedia = jest.fn().mockReturnValue( { matches: true } );
	} );

	describe( 'for a user who cannot manage modules', () => {
		beforeEach( () => canCurrentUser.mockReturnValue( false ) );

		it( 'hides a failed metric rather than showing it as zero', () => {
			moduleStates( { protect: ok( 12345 ), akismet: failed() } );
			render( <Modules siteId={ 1 } adminBaseUrl="https://example.test/wp-admin/" /> );

			expect( screen.getByText( 'Blocked login attempts' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Blocked spam comments' ) ).not.toBeInTheDocument();
		} );

		it( 'hides the Anti-spam link along with the Akismet metric', () => {
			moduleStates( { protect: ok( 12345 ), akismet: failed() } );
			render( <Modules siteId={ 1 } adminBaseUrl="https://example.test/wp-admin/" /> );

			expect(
				screen.queryByRole( 'link', { name: 'Anti-spam insights' } )
			).not.toBeInTheDocument();
		} );

		it( 'hides the whole section when neither metric can be shown', () => {
			moduleStates( { protect: failed(), akismet: failed() } );
			const { container } = render(
				<Modules siteId={ 1 } adminBaseUrl="https://example.test/wp-admin/" />
			);

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'shows both metrics and the link when the data loads', () => {
			moduleStates( { protect: ok( 12345 ), akismet: ok( 9520 ) } );
			render( <Modules siteId={ 1 } adminBaseUrl="https://example.test/wp-admin/" /> );

			expect( screen.getByText( 'Blocked login attempts' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Blocked spam comments' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Anti-spam insights' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'for a user who can manage modules', () => {
		beforeEach( () => canCurrentUser.mockReturnValue( true ) );

		it( 'keeps a failed metric, so they can activate it', () => {
			moduleStates( { protect: ok( 12345 ), akismet: failed( 'not_installed' ) } );
			render( <Modules siteId={ 1 } adminBaseUrl="https://example.test/wp-admin/" /> );

			expect( screen.getByText( 'Blocked spam comments' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Install' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Anti-spam insights' } ) ).toBeInTheDocument();
		} );
	} );
} );
