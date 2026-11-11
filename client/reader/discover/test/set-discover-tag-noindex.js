import { setDiscoverTagNoindex } from '../set-discover-tag-noindex';

function makeContext( query, meta = [] ) {
	const dispatched = [];
	return {
		query,
		store: {
			getState: () => ( { documentHead: { meta } } ),
			dispatch: ( action ) => dispatched.push( action ),
		},
		dispatched,
	};
}

const robotsMeta = ( context ) =>
	context.dispatched
		.flatMap( ( action ) => action.meta || [] )
		.filter( ( { name } ) => name === 'robots' );

describe( 'setDiscoverTagNoindex', () => {
	test( 'adds a noindex robots meta when a tag is selected', () => {
		const next = jest.fn();
		const context = makeContext( { selectedTag: 'food' } );

		setDiscoverTagNoindex( context, next );

		expect( robotsMeta( context ) ).toEqual( [ { name: 'robots', content: 'noindex' } ] );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'keeps existing meta and replaces any prior robots meta', () => {
		const context = makeContext( { selectedTag: 'food' }, [
			{ name: 'description', content: 'Discover' },
			{ name: 'robots', content: 'index' },
		] );

		setDiscoverTagNoindex( context, jest.fn() );

		expect( context.dispatched[ 0 ].meta ).toEqual( [
			{ name: 'description', content: 'Discover' },
			{ name: 'robots', content: 'noindex' },
		] );
	} );

	test( 'does nothing for the bare /discover/tags page', () => {
		const next = jest.fn();
		const context = makeContext( {} );

		setDiscoverTagNoindex( context, next );

		expect( context.dispatched ).toHaveLength( 0 );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
