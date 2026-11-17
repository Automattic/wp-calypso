import { getCachedRuntimeStyles, getUsedRuntimeStyles } from '../runtime-styles';

describe( 'getCachedRuntimeStyles', () => {
	test( 'caches empty markup but retries after a failed render', () => {
		const empty = jest.fn( () => '' );
		getCachedRuntimeStyles( 'empty', empty );
		getCachedRuntimeStyles( 'empty', empty );
		expect( empty ).toHaveBeenCalledTimes( 1 );

		const failed = jest.fn( () => undefined );
		getCachedRuntimeStyles( 'failed', failed );
		getCachedRuntimeStyles( 'failed', failed );
		expect( failed ).toHaveBeenCalledTimes( 2 );
	} );
} );

describe( 'getUsedRuntimeStyles', () => {
	test( 'returns only the styles whose hashed classes appear in the markup', () => {
		const styles = new Map( [
			[ 'used', '._3c9fbdd1d22909c5__track{height:2px}' ],
			[ 'also-used', '.a1b2c3d4e5f60718__root:hover{color:red}' ],
			[ 'unused', '.ffffffffffffffff__other{color:blue}' ],
		] );
		const markup =
			'<div class="_3c9fbdd1d22909c5__track"></div><span class="x a1b2c3d4e5f60718__root"></span>';

		expect( getUsedRuntimeStyles( markup, styles ) ).toEqual( [
			[ 'used', '._3c9fbdd1d22909c5__track{height:2px}' ],
			[ 'also-used', '.a1b2c3d4e5f60718__root:hover{color:red}' ],
		] );
	} );
} );
