/**
 * @jest-environment jsdom
 */
import { setBrowsePluginsNoindex } from '../controller-logged-out';

function makeContext( category, { isServerSide = true, loggedIn = false, meta = [] } = {} ) {
	const dispatched = [];
	return {
		isServerSide,
		params: { category },
		store: {
			getState: () => ( {
				// isUserLoggedIn() reads currentUser?.id !== null, so an explicit
				// null id is required to represent a logged-out request.
				currentUser: { id: loggedIn ? 123 : null },
				documentHead: { meta },
			} ),
			dispatch: ( action ) => dispatched.push( action ),
		},
		dispatched,
	};
}

const robotsMeta = ( context ) =>
	context.dispatched
		.flatMap( ( action ) => action.meta || [] )
		.filter( ( { name } ) => name === 'robots' );

describe( 'setBrowsePluginsNoindex', () => {
	test( 'adds noindex robots meta for an uncurated tag fallthrough term', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer' );

		setBrowsePluginsNoindex( context, next );

		expect( robotsMeta( context ) ).toEqual( [ { name: 'robots', content: 'noindex' } ] );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does NOT add noindex for a curated ALLOWED_CATEGORIES term', () => {
		const next = jest.fn();
		const context = makeContext( 'seo' );

		setBrowsePluginsNoindex( context, next );

		expect( context.dispatched ).toHaveLength( 0 );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'matches curated categories case-insensitively (e.g. jobBoards via jobboards)', () => {
		const upper = makeContext( 'SEO' );
		setBrowsePluginsNoindex( upper, jest.fn() );
		expect( upper.dispatched ).toHaveLength( 0 );

		// `jobBoards` is camelCase in the allowlist but lowercased in URLs.
		const camel = makeContext( 'jobboards' );
		setBrowsePluginsNoindex( camel, jest.fn() );
		expect( camel.dispatched ).toHaveLength( 0 );
	} );

	test( 'does nothing on client-side (non-SSR) requests', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer', { isServerSide: false } );

		setBrowsePluginsNoindex( context, next );

		expect( context.dispatched ).toHaveLength( 0 );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does nothing for logged-in users', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer', { loggedIn: true } );

		setBrowsePluginsNoindex( context, next );

		expect( context.dispatched ).toHaveLength( 0 );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'preserves existing non-robots meta and replaces any prior robots meta', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer', {
			meta: [
				{ name: 'description', content: 'Plugins' },
				{ name: 'robots', content: 'index' },
			],
		} );

		setBrowsePluginsNoindex( context, next );

		const { meta } = context.dispatched[ 0 ];
		expect( meta ).toContainEqual( { name: 'description', content: 'Plugins' } );
		expect( meta.filter( ( { name } ) => name === 'robots' ) ).toEqual( [
			{ name: 'robots', content: 'noindex' },
		] );
	} );
} );
