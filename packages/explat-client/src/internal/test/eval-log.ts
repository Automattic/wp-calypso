import { createEvalLog } from '../eval-log';

describe( 'createEvalLog', () => {
	test( 'records entries in insertion order', () => {
		const log = createEvalLog( 100 );
		log.record( {
			flag_key: 'a',
			value: 'control',
			source: 'default',
			timestamp: 1,
			attributes: {},
		} );
		log.record( {
			flag_key: 'b',
			value: true,
			source: 'override',
			timestamp: 2,
			attributes: { wpcom_user_id: '1' },
		} );
		expect( log.entries() ).toHaveLength( 2 );
		expect( log.entries()[ 0 ].flag_key ).toBe( 'a' );
		expect( log.entries()[ 1 ].source ).toBe( 'override' );
	} );

	test( 'caps at the configured size, dropping oldest', () => {
		const log = createEvalLog( 3 );
		for ( let i = 0; i < 5; i++ ) {
			log.record( {
				flag_key: `f${ i }`,
				value: i,
				source: 'default',
				timestamp: i,
				attributes: {},
			} );
		}
		expect( log.entries().map( ( e ) => e.flag_key ) ).toEqual( [ 'f2', 'f3', 'f4' ] );
	} );

	test( 'clear() empties the buffer', () => {
		const log = createEvalLog( 10 );
		log.record( {
			flag_key: 'a',
			value: 1,
			source: 'default',
			timestamp: 1,
			attributes: {},
		} );
		log.clear();
		expect( log.entries() ).toEqual( [] );
	} );

	test( 'entries() returns a copy, not a live reference', () => {
		const log = createEvalLog( 10 );
		log.record( {
			flag_key: 'a',
			value: 1,
			source: 'default',
			timestamp: 1,
			attributes: {},
		} );
		const snap = log.entries();
		log.record( {
			flag_key: 'b',
			value: 2,
			source: 'default',
			timestamp: 2,
			attributes: {},
		} );
		expect( snap ).toHaveLength( 1 );
	} );

	test( 'capacity of 0 records nothing', () => {
		const log = createEvalLog( 0 );
		log.record( {
			flag_key: 'a',
			value: 1,
			source: 'default',
			timestamp: 1,
			attributes: {},
		} );
		expect( log.entries() ).toEqual( [] );
	} );
} );
