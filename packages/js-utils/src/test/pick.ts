import pick from '../pick';

describe( 'pick', () => {
	it( 'should return all object properties', () => {
		expect(
			pick(
				{
					a: 'a',
					b: 'b',
				},
				[ 'a', 'b' ]
			)
		).toMatchObject( {
			a: 'a',
			b: 'b',
		} );
	} );

	it( 'should return some object properties', () => {
		expect(
			pick(
				{
					a: 'a',
					b: 'b',
				},
				[ 'b' ]
			)
		).toMatchObject( { b: 'b' } );
	} );

	it( 'should return no object properties', () => {
		expect(
			pick(
				{
					a: 'a',
				},
				[]
			)
		).toMatchObject( {} );
	} );

	it( 'should return empty object for null properties', () => {
		expect(
			pick(
				{
					a: 'a',
				},
				null
			)
		).toMatchObject( {} );
	} );

	it( 'should return empty object for a null object', () => {
		expect( pick( null, [ 'a' ] ) ).toMatchObject( {} );
	} );
} );
