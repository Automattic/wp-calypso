import {
	PREMADE_VIEWS,
	getPremadeFilter,
	getPremadeView,
	resolveViewOrder,
} from '../premade-views';

describe( 'premade views', () => {
	it( 'exposes every view by name', () => {
		PREMADE_VIEWS.forEach( ( view ) => {
			expect( getPremadeView( view.name ) ).toBe( view );
		} );
	} );

	it( 'returns nothing for a name it does not own', () => {
		expect( getPremadeView( 'comments' ) ).toBeUndefined();
		expect( getPremadeFilter( 'comments' ) ).toBeUndefined();
	} );

	it( 'builds a comma-separated type query', () => {
		expect( getPremadeFilter( 'following' )?.query ).toEqual( { type: 'new_post' } );
		expect( getPremadeFilter( 'store' )?.query.type.split( ',' ) ).toContain( 'store_order' );
	} );

	// `trophy` is a server-side alias covering the achieve/best name prefixes, so the
	// ~60 badge types don't have to be listed (and future ones are picked up).
	it( 'queries the badge types through the trophy alias', () => {
		expect( getPremadeFilter( 'wordpress_com' )?.query.type.split( ',' ) ).toContain( 'trophy' );
	} );

	it( 'never repeats a type across views', () => {
		const all = PREMADE_VIEWS.flatMap( ( view ) => view.types );
		expect( new Set( all ).size ).toBe( all.length );
	} );

	// The server owns membership for these views; the predicate only exists so the
	// shared filter shape works.
	it( 'accepts every note the server returned', () => {
		expect( getPremadeFilter( 'sites' )?.filter() ).toBe( true );
	} );
} );

describe( 'resolveViewOrder', () => {
	const known = [
		{ name: 'all', label: 'All', isPremade: false },
		{ name: 'unread', label: 'Unread', isPremade: false },
		{ name: 'comments', label: 'Comments', isPremade: false },
		{ name: 'likes', label: 'Likes', isPremade: false },
		{ name: 'store', label: 'Store', isPremade: true },
	];

	const names = ( stored?: { name: string; hidden?: boolean }[] ) =>
		resolveViewOrder( known, stored ).map(
			( { view, hidden } ) => `${ view.name }${ hidden ? ':hidden' : '' }`
		);

	it( 'shows the built-in views and hides the premade ones when nothing is stored', () => {
		expect( names() ).toEqual( [ 'all', 'unread', 'comments', 'likes', 'store:hidden' ] );
	} );

	it( 'keeps the pinned views first whatever the stored order says', () => {
		expect( names( [ { name: 'store' }, { name: 'unread' } ] ) ).toEqual( [
			'all',
			'unread',
			'store',
			'comments',
			'likes',
		] );
	} );

	it( 'appends a view the stored list has never seen, at its default', () => {
		expect( names( [ { name: 'likes' }, { name: 'comments', hidden: true } ] ) ).toEqual( [
			'all',
			'unread',
			'likes',
			'comments:hidden',
			'store:hidden',
		] );
	} );

	it( 'ignores stored views it no longer knows about', () => {
		expect( names( [ { name: 'retired_view' }, { name: 'likes' } ] ) ).toEqual( [
			'all',
			'unread',
			'likes',
			'comments',
			'store:hidden',
		] );
	} );
} );
