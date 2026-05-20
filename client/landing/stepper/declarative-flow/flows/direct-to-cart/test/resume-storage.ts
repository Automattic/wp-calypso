/**
 * @jest-environment jsdom
 */
import {
	readResumeRecord,
	writeResumeRecord,
	clearResumeRecord,
	resumeKey,
} from '../resume-storage';

describe( 'resume-storage', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	describe( 'resumeKey', () => {
		it( 'composes a stable key from integration and contextId', () => {
			expect( resumeKey( 'telex', 'proj-1' ) ).toBe( 'direct-to-cart:telex:proj-1' );
		} );

		it( 'normalizes nulls to empty strings', () => {
			expect( resumeKey( null, null ) ).toBe( 'direct-to-cart::' );
			expect( resumeKey( 'telex', null ) ).toBe( 'direct-to-cart:telex:' );
		} );
	} );

	describe( 'read/write/clear', () => {
		it( 'round-trips a record', () => {
			writeResumeRecord( resumeKey( 'telex', 'proj-1' ), {
				siteSlug: 'a.wordpress.com',
				plan: 'business-bundle',
			} );
			const record = readResumeRecord( resumeKey( 'telex', 'proj-1' ) );
			expect( record?.siteSlug ).toBe( 'a.wordpress.com' );
			expect( record?.plan ).toBe( 'business-bundle' );
			expect( typeof record?.createdAt ).toBe( 'number' );
		} );

		it( 'returns null when no record', () => {
			expect( readResumeRecord( resumeKey( 'telex', 'none' ) ) ).toBeNull();
		} );

		it( 'returns null and removes the key when the record is older than the TTL', () => {
			const key = resumeKey( 'telex', 'old' );
			window.localStorage.setItem(
				key,
				JSON.stringify( {
					siteSlug: 'b.wordpress.com',
					plan: 'business-bundle',
					createdAt: 0, // epoch — definitely expired
				} )
			);
			expect( readResumeRecord( key ) ).toBeNull();
			expect( window.localStorage.getItem( key ) ).toBeNull();
		} );

		it( 'returns null and removes the key when JSON is malformed', () => {
			const key = resumeKey( 'telex', 'bad' );
			window.localStorage.setItem( key, 'not-json' );
			expect( readResumeRecord( key ) ).toBeNull();
			expect( window.localStorage.getItem( key ) ).toBeNull();
		} );

		it( 'clears a specific key', () => {
			const key = resumeKey( 'telex', 'proj-1' );
			writeResumeRecord( key, { siteSlug: 'a.wordpress.com', plan: 'business-bundle' } );
			clearResumeRecord( key );
			expect( readResumeRecord( key ) ).toBeNull();
		} );

		it( 'survives localStorage exceptions silently', () => {
			const setItem = jest
				.spyOn( window.localStorage.__proto__, 'setItem' )
				.mockImplementation( () => {
					throw new Error( 'quota exceeded' );
				} );
			expect( () =>
				writeResumeRecord( resumeKey( 'telex', 'q' ), {
					siteSlug: 'a.wordpress.com',
					plan: 'business-bundle',
				} )
			).not.toThrow();
			setItem.mockRestore();
		} );
	} );
} );
