import { buildPathHelper } from '../index';

describe( 'paths helpers', () => {
	it( 'returns the path without query params', () => {
		const testPath = buildPathHelper( '/test' );
		expect( testPath() ).toBe( '/test' );
	} );

	it( 'adds returns the path with query params', () => {
		const testPath = buildPathHelper< {
			queryParams: {
				from: string;
			};
		} >( '/test' );
		expect( testPath( { from: 'test' } ) ).toBe( '/test?from=test' );
	} );

	it( 'returns the path with path params', () => {
		const testPath = buildPathHelper< {
			params: {
				id: string;
			};
		} >( '/test/:id' );
		expect( testPath( null, { id: '123' } ) ).toBe( '/test/123' );
	} );

	it( 'returns path with query params and path params', () => {
		const testPath = buildPathHelper< {
			queryParams: {
				from: string;
			};
			params: {
				id: string;
			};
		} >( '/test/:id' );
		expect( testPath( { from: 'test' }, { id: '123' } ) ).toBe( '/test/123?from=test' );
	} );

	it( 'return path without query params set as null', () => {
		const testPath = buildPathHelper< {
			queryParams: {
				from: string | null;
			};
		} >( '/test' );

		expect( testPath( null ) ).toBe( '/test' );
	} );
} );
