/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import { redirectIfCurrentUserCannot, redirectLoggedOut } from 'calypso/controller';
import { siteSelection } from 'calypso/my-sites/controller';
import { renderSiteRedesign } from '../controller';
import registerSiteRedesign from '../index';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: jest.fn() } ) );
jest.mock( '@automattic/calypso-router', () => ( { __esModule: true, default: jest.fn() } ) );
jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	render: jest.fn(),
	redirectLoggedOut: jest.fn(),
	redirectIfCurrentUserCannot: jest.fn( ( capability: string ) => `can:${ capability }` ),
} ) );
jest.mock( 'calypso/my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 1,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );
jest.mock( '../main', () => () => null );

const contextFor = ( query: Record< string, string > = {} ) =>
	( { store: { getState: () => ( {} ) }, query } ) as unknown as Context;

describe( 'site redesign route', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'requires login, a selected site and both theme capabilities before rendering', () => {
		jest.mocked( isEnabled ).mockReturnValue( true );
		registerSiteRedesign();

		const [ path, ...handlers ] = jest.mocked( page ).mock.calls[ 0 ] as unknown[];
		expect( path ).toBe( '/site-redesign/:site' );
		expect( redirectIfCurrentUserCannot ).toHaveBeenCalledWith( 'manage_options' );
		expect( redirectIfCurrentUserCannot ).toHaveBeenCalledWith( 'edit_theme_options' );
		const guards = [
			redirectLoggedOut,
			siteSelection,
			'can:manage_options',
			'can:edit_theme_options',
		];
		expect( handlers.slice( 0, guards.length ) ).toEqual( guards );
		expect( handlers.indexOf( renderSiteRedesign ) ).toBe( guards.length );
	} );

	it( 'does not register the route when the flag is off', () => {
		jest.mocked( isEnabled ).mockReturnValue( false );
		registerSiteRedesign();
		expect( page ).not.toHaveBeenCalled();
	} );
} );

describe( 'renderSiteRedesign', () => {
	it( 'passes the redesign id and the checkout return on', () => {
		const id = 'rd_' + 'a'.repeat( 32 );
		const context = contextFor( { redesign: id, resume: 'apply' } );
		renderSiteRedesign( context, jest.fn() );
		expect( context.primary.props ).toMatchObject( {
			siteId: 1,
			siteSlug: 'example.wordpress.com',
			redesignId: id,
			resume: true,
		} );
	} );

	it( 'starts without a redesign when the URL has none', () => {
		const context = contextFor();
		renderSiteRedesign( context, jest.fn() );
		expect( context.primary.props ).toMatchObject( { redesignId: null, resume: false } );
	} );
} );
