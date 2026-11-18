import { init, isReadStatusPending, markReadStatus } from '../wpcom';

describe( 'markReadStatus', () => {
	let postCalls;

	beforeEach( () => {
		postCalls = [];
		init( {
			req: {
				post: ( { path }, _query, body, callback ) => postCalls.push( { path, body, callback } ),
			},
		} );
	} );

	it( 'sends the request straight away when nothing is pending for the note', () => {
		markReadStatus( 5, true, () => {} );

		expect( postCalls ).toHaveLength( 1 );
		expect( postCalls[ 0 ] ).toMatchObject( {
			path: '/notifications/read',
			body: { counts: { 5: 9999 } },
		} );
	} );

	it( 'holds a second request for the same note until the first one is answered', () => {
		const order = [];
		markReadStatus( 5, true, () => order.push( 'read answered' ) );
		markReadStatus( 5, false, () => order.push( 'unread answered' ) );

		expect( postCalls ).toHaveLength( 1 );

		postCalls[ 0 ].callback( null, { success: true } );

		expect( order ).toEqual( [ 'read answered' ] );
		expect( postCalls ).toHaveLength( 2 );
		expect( postCalls[ 1 ].body ).toEqual( { counts: { 5: -1 } } );

		postCalls[ 1 ].callback( null, { success: true } );

		expect( order ).toEqual( [ 'read answered', 'unread answered' ] );
	} );

	it( 'sends the next request after a failed one', () => {
		markReadStatus( 5, true, () => {} );
		markReadStatus( 5, false, () => {} );

		postCalls[ 0 ].callback( new Error( 'offline' ) );

		expect( postCalls ).toHaveLength( 2 );
	} );

	it( 'sends the next request when a callback throws', () => {
		markReadStatus( 5, true, () => {
			throw new Error( 'broken callback' );
		} );
		markReadStatus( 5, false, () => {} );

		expect( () => postCalls[ 0 ].callback( null, { success: true } ) ).toThrow( 'broken callback' );
		expect( postCalls ).toHaveLength( 2 );
	} );

	it( 'does not hold requests for other notes', () => {
		markReadStatus( 5, true, () => {} );
		markReadStatus( 6, true, () => {} );

		expect( postCalls ).toHaveLength( 2 );
	} );

	it( 'reports a note as pending until its last request is answered', () => {
		markReadStatus( 5, true, () => {} );
		markReadStatus( '5', false, () => {} );

		expect( isReadStatusPending( 5 ) ).toBe( true );
		expect( isReadStatusPending( 6 ) ).toBe( false );

		postCalls[ 0 ].callback( null, { success: true } );
		expect( isReadStatusPending( 5 ) ).toBe( true );

		postCalls[ 1 ].callback( null, { success: true } );
		expect( isReadStatusPending( 5 ) ).toBe( false );
	} );

	it( 'still sends a waiting request after init() is called again with the same provider', () => {
		const provider = {
			req: {
				post: ( { path }, _query, body, callback ) => postCalls.push( { path, body, callback } ),
			},
		};
		init( provider );
		const order = [];
		markReadStatus( 5, true, () => order.push( 'read answered' ) );
		markReadStatus( 5, false, () => order.push( 'unread answered' ) );

		init( provider );
		expect( isReadStatusPending( 5 ) ).toBe( true );

		postCalls[ 0 ].callback( null, { success: true } );
		expect( postCalls ).toHaveLength( 2 );
		expect( postCalls[ 1 ].body ).toEqual( { counts: { 5: -1 } } );

		postCalls[ 1 ].callback( null, { success: true } );
		expect( order ).toEqual( [ 'read answered', 'unread answered' ] );
		expect( isReadStatusPending( 5 ) ).toBe( false );
	} );
} );
