import { evalCondition } from '../condition';
import type { Attributes, Condition } from '../types';

const matches = ( attrs: Attributes, cond: Condition ) => evalCondition( attrs, cond );

describe( 'evalCondition — field shorthands', () => {
	it( 'literal-string shorthand matches when equal', () => {
		expect( matches( { country: 'US' }, { country: 'US' } ) ).toBe( true );
	} );

	it( 'literal-string shorthand fails when not equal', () => {
		expect( matches( { country: 'CA' }, { country: 'US' } ) ).toBe( false );
	} );

	it( 'array shorthand acts like $in', () => {
		expect( matches( { country: 'US' }, { country: [ 'US', 'CA' ] } ) ).toBe( true );
		expect( matches( { country: 'DE' }, { country: [ 'US', 'CA' ] } ) ).toBe( false );
	} );
} );

describe( 'evalCondition — operator forms', () => {
	it( 'matches explicit $eq', () => {
		expect( matches( { country: 'US' }, { country: { $eq: 'US' } } ) ).toBe( true );
	} );

	it( 'matches $in when value present in list', () => {
		expect( matches( { country: 'CA' }, { country: { $in: [ 'US', 'CA' ] } } ) ).toBe( true );
	} );

	it( 'fails $in when value not in list', () => {
		expect( matches( { country: 'DE' }, { country: { $in: [ 'US', 'CA' ] } } ) ).toBe( false );
	} );

	it( 'fails $in when list is empty', () => {
		expect( matches( { country: 'US' }, { country: { $in: [] } } ) ).toBe( false );
	} );
} );

describe( 'evalCondition — $exists', () => {
	it( '$exists:true matches when value present', () => {
		expect( matches( { wpcom_user_id: '1' }, { wpcom_user_id: { $exists: true } } ) ).toBe( true );
	} );

	it( '$exists:true fails when missing', () => {
		expect( matches( {}, { wpcom_user_id: { $exists: true } } ) ).toBe( false );
	} );

	it( '$exists:false matches when missing', () => {
		expect( matches( {}, { wpcom_user_id: { $exists: false } } ) ).toBe( true );
	} );

	it( '$exists:true treats explicit null as absent', () => {
		expect( matches( { wpcom_user_id: null }, { wpcom_user_id: { $exists: true } } ) ).toBe(
			false
		);
	} );

	it( '$exists:false treats explicit null as absent', () => {
		expect( matches( { wpcom_user_id: null }, { wpcom_user_id: { $exists: false } } ) ).toBe(
			true
		);
	} );
} );

describe( 'evalCondition — logical operators', () => {
	it( '$and passes when every child matches', () => {
		expect(
			matches(
				{ country: 'US', language: 'en' },
				{ $and: [ { country: 'US' }, { language: 'en' } ] }
			)
		).toBe( true );
	} );

	it( '$and fails when any child fails', () => {
		expect(
			matches(
				{ country: 'US', language: 'fr' },
				{ $and: [ { country: 'US' }, { language: 'en' } ] }
			)
		).toBe( false );
	} );

	it( '$or passes when any child matches', () => {
		expect( matches( { country: 'CA' }, { $or: [ { country: 'US' }, { country: 'CA' } ] } ) ).toBe(
			true
		);
	} );

	it( '$or fails when no child matches', () => {
		expect( matches( { country: 'DE' }, { $or: [ { country: 'US' }, { country: 'CA' } ] } ) ).toBe(
			false
		);
	} );

	it( 'logical operator + sibling field are ANDed together', () => {
		const cond: Condition = {
			$or: [ { country: 'US' }, { country: 'CA' } ],
			language: 'en',
		};
		expect( matches( { country: 'CA', language: 'en' }, cond ) ).toBe( true );
		expect( matches( { country: 'CA', language: 'fr' }, cond ) ).toBe( false );
		expect( matches( { country: 'DE', language: 'en' }, cond ) ).toBe( false );
	} );
} );

describe( 'evalCondition — fail-closed edge cases', () => {
	it( 'unknown field-level operator returns false', () => {
		expect(
			evalCondition( { country: 'US' }, { country: { $gt: 'A' } } as unknown as Condition )
		).toBe( false );
	} );

	it( 'unknown top-level operator returns false', () => {
		expect( evalCondition( { country: 'US' }, { $unknown: 1 } as unknown as Condition ) ).toBe(
			false
		);
	} );

	it( 'empty condition object matches', () => {
		expect( matches( { country: 'US' }, {} as Condition ) ).toBe( true );
	} );

	it( 'empty $and / $or arrays fail closed', () => {
		expect( matches( { country: 'US' }, { $and: [] } ) ).toBe( false );
		expect( matches( { country: 'US' }, { $or: [] } ) ).toBe( false );
	} );

	it( 'empty operator object on a field is non-match (PHP parity)', () => {
		// PHP decodes `{}` as an empty associative array, falling into the
		// empty-list `$in` shorthand which is non-match. Ensure TS agrees.
		expect( matches( { country: 'US' }, { country: {} } as Condition ) ).toBe( false );
	} );
} );
