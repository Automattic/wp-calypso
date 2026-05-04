/**
 * @jest-environment node
 */
import { isMigratedStream } from '../migrated-stream-types';

describe( 'isMigratedStream', () => {
	it( 'returns true for `following`', () => {
		expect( isMigratedStream( 'following' ) ).toBe( true );
	} );

	it( 'returns true for every `discover` sub-tab', () => {
		expect( isMigratedStream( 'discover' ) ).toBe( true );
	} );

	it( 'returns false for unmigrated stream types', () => {
		expect( isMigratedStream( 'site' ) ).toBe( false );
		expect( isMigratedStream( 'feed' ) ).toBe( false );
		expect( isMigratedStream( 'a8c' ) ).toBe( false );
		expect( isMigratedStream( 'recommendations_posts' ) ).toBe( false );
	} );
} );
