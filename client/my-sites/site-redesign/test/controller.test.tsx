/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { renderSiteRedesign, requireSiteRedesignAccess } from '../controller';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: jest.fn() } ) );
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );
jest.mock( 'calypso/state/selectors/can-current-user', () => ( { canCurrentUser: jest.fn() } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: ( state: { siteId: number | null } ) => state.siteId,
	getSelectedSiteSlug: ( state: { siteId: number | null } ) =>
		state.siteId ? 'example.wordpress.com' : null,
} ) );
jest.mock( '../main', () => () => null );

const contextFor = ( siteId: number | null, query: Record< string, string > = {} ) =>
	( { store: { getState: () => ( { siteId } ) }, query } ) as unknown as Context;

describe( 'requireSiteRedesignAccess', () => {
	beforeEach( () => {
		jest.mocked( isEnabled ).mockReturnValue( true );
		jest.mocked( canCurrentUser ).mockReturnValue( true );
	} );
	afterEach( () => jest.clearAllMocks() );

	it( 'lets a site admin through', () => {
		const next = jest.fn();
		requireSiteRedesignAccess( contextFor( 1 ), next );
		expect( next ).toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'sends a user who cannot manage the site back to Themes', () => {
		jest
			.mocked( canCurrentUser )
			.mockImplementation( ( _state, _siteId, capability ) => capability !== 'manage_options' );
		const next = jest.fn();
		requireSiteRedesignAccess( contextFor( 1 ), next );
		expect( next ).not.toHaveBeenCalled();
		expect( page.redirect ).toHaveBeenCalledWith( '/themes/example.wordpress.com' );
	} );

	it( 'sends everyone back to Themes when the flag is off', () => {
		jest.mocked( isEnabled ).mockReturnValue( false );
		const next = jest.fn();
		requireSiteRedesignAccess( contextFor( 1 ), next );
		expect( next ).not.toHaveBeenCalled();
		expect( page.redirect ).toHaveBeenCalledWith( '/themes/example.wordpress.com' );
	} );

	it( 'sends the user to Themes when no site is selected', () => {
		const next = jest.fn();
		requireSiteRedesignAccess( contextFor( null ), next );
		expect( next ).not.toHaveBeenCalled();
		expect( page.redirect ).toHaveBeenCalledWith( '/themes' );
	} );
} );

describe( 'renderSiteRedesign', () => {
	it( 'passes a valid redesign id and the checkout return on', () => {
		const id = 'rd_' + 'a'.repeat( 32 );
		const context = contextFor( 1, { redesign: id, resume: 'apply' } );
		renderSiteRedesign( context, jest.fn() );
		expect( context.primary.props ).toMatchObject( {
			siteId: 1,
			siteSlug: 'example.wordpress.com',
			redesignId: id,
			resume: true,
		} );
	} );

	it( 'ignores a malformed redesign id', () => {
		const context = contextFor( 1, { redesign: '../evil' } );
		renderSiteRedesign( context, jest.fn() );
		expect( context.primary.props ).toMatchObject( { redesignId: null, resume: false } );
	} );
} );
