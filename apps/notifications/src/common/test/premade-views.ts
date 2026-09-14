import { PREMADE_VIEWS, resolveViewOrder } from '../premade-views';

describe( 'premade views', () => {
	it( 'never repeats a type across views', () => {
		const all = PREMADE_VIEWS.flatMap( ( view ) => view.types );
		expect( new Set( all ).size ).toBe( all.length );
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

	// The stored value says what is switched off, never what order to use — there is no
	// way to reorder views, so honouring a stale order would only shuffle the tabs.
	it( 'keeps the declared order whatever the stored order says', () => {
		expect( names( [ { name: 'store' }, { name: 'likes', hidden: true } ] ) ).toEqual( [
			'all',
			'unread',
			'comments',
			'likes:hidden',
			'store',
		] );
	} );

	it( 'leaves a view the stored list has never seen at its default', () => {
		expect( names( [ { name: 'comments', hidden: true } ] ) ).toEqual( [
			'all',
			'unread',
			'comments:hidden',
			'likes',
			'store:hidden',
		] );
	} );

	it( 'ignores stored views it no longer knows about', () => {
		expect( names( [ { name: 'retired_view' }, { name: 'store' } ] ) ).toEqual( [
			'all',
			'unread',
			'comments',
			'likes',
			'store',
		] );
	} );

	it( 'keeps the pinned views first even if they are declared elsewhere', () => {
		const shuffled = [ known[ 2 ], known[ 4 ], known[ 0 ], known[ 1 ] ];
		expect( resolveViewOrder( shuffled ).map( ( { view } ) => view.name ) ).toEqual( [
			'all',
			'unread',
			'comments',
			'store',
		] );
	} );
} );
