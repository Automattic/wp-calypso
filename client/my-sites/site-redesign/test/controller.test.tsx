/**
 * @vitest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import { vi } from 'vitest';
import { redirectIfCurrentUserCannot, redirectLoggedOut } from 'calypso/controller';
import { siteSelection } from 'calypso/my-sites/controller';
import { renderSiteRedesign } from '../controller';
import registerSiteRedesign from '../index';

vi.mock( '@automattic/calypso-config', () =>
	( ( m ) => ( { ...m, default: m } ) )( { isEnabled: vi.fn() } )
);
vi.mock( '@automattic/calypso-router', () => ( { __esModule: true, default: vi.fn() } ) );
vi.mock( 'calypso/controller', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		makeLayout: vi.fn(),
		render: vi.fn(),
		redirectLoggedOut: vi.fn(),
		redirectIfCurrentUserCannot: vi.fn( ( capability: string ) => `can:${ capability }` ),
	} )
);
vi.mock( 'calypso/my-sites/controller', () => ( {
	navigation: vi.fn(),
	sites: vi.fn(),
	siteSelection: vi.fn(),
} ) );
vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 1,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );
vi.mock( '../main', () => ( { default: () => null } ) );

const contextFor = ( query: Record< string, string > = {} ) =>
	( { store: { getState: () => ( {} ) }, query } ) as unknown as Context;

describe( 'site redesign route', () => {
	afterEach( () => vi.clearAllMocks() );

	it( 'requires login, a selected site and both theme capabilities before rendering', () => {
		vi.mocked( isEnabled ).mockReturnValue( true );
		registerSiteRedesign();

		const calls = vi.mocked( page ).mock.calls as unknown[][];
		const [ , ...handlers ] = calls.find( ( [ path ] ) => path === '/site-redesign/:site' ) ?? [];
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

	it( 'registers the route whatever the flag says', () => {
		vi.mocked( isEnabled ).mockReturnValue( false );
		registerSiteRedesign();
		const calls = vi.mocked( page ).mock.calls as unknown[][];
		expect( calls.some( ( [ path ] ) => path === '/site-redesign/:site' ) ).toBe( true );
	} );

	it( 'passes the redesign id and the checkout return on', () => {
		const id = 'rd_' + 'a'.repeat( 32 );
		const context = contextFor( { redesign: id, resume: 'apply' } );
		renderSiteRedesign( context, vi.fn() );
		expect( context.primary.props ).toMatchObject( {
			siteId: 1,
			siteSlug: 'example.wordpress.com',
			redesignId: id,
			resume: true,
		} );
	} );

	it( 'starts without a redesign when the URL has none', () => {
		const context = contextFor();
		renderSiteRedesign( context, vi.fn() );
		expect( context.primary.props ).toMatchObject( { redesignId: null, resume: false } );
	} );

	it( 'renders without the site sidebar', () => {
		const context = contextFor();
		renderSiteRedesign( context, vi.fn() );
		expect( context.secondary ).toBeNull();
	} );

	it( 'treats resume without a redesign id as a fresh start', () => {
		const next = vi.fn();
		const context = contextFor( { resume: 'apply' } ) as unknown as {
			primary: { props: { resume: boolean; redesignId: string | null } };
		};
		renderSiteRedesign( context as never, next );
		expect( context.primary.props ).toMatchObject( { resume: false, redesignId: null } );

		const withId = contextFor( { resume: 'apply', redesign: 'rd_1' } ) as unknown as typeof context;
		renderSiteRedesign( withId as never, next );
		expect( withId.primary.props ).toMatchObject( { resume: true, redesignId: 'rd_1' } );
	} );
} );
