/**
 * @jest-environment jsdom
 */
import { isSeenPostsAvailable } from '@automattic/api-queries';

describe( 'isSeenPostsAvailable', () => {
	test( 'returns true for Automatticians', () => {
		expect( isSeenPostsAvailable( [ { slug: 'a8c' } ] ) ).toBe( true );
	} );

	test( 'returns false for non-Automatticians', () => {
		expect( isSeenPostsAvailable( [ { slug: 'other' } ] ) ).toBe( false );
		expect( isSeenPostsAvailable( [] ) ).toBe( false );
		expect( isSeenPostsAvailable( null ) ).toBe( false );
		expect( isSeenPostsAvailable( undefined ) ).toBe( false );
	} );
} );
