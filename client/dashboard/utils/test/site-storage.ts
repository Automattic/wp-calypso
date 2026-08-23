import { formatStorage, getStorageUsagePercent } from '../site-storage';

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

describe( 'formatStorage', () => {
	test( 'matches wp-admin size_format output', () => {
		expect( formatStorage( 573_175_398 ) ).toBe( '546.6 MB' );
		expect( formatStorage( 3.1 * GB ) ).toBe( '3.1 GB' );
		expect( formatStorage( 3 * GB ) ).toBe( '3.0 GB' );
		expect( formatStorage( 6 * GB ) ).toBe( '6.0 GB' );
	} );

	test( 'picks the largest unit the value reaches, like size_format', () => {
		expect( formatStorage( 0 ) ).toBe( '0.0 B' );
		expect( formatStorage( 1023 ) ).toBe( '1,023.0 B' );
		expect( formatStorage( KB ) ).toBe( '1.0 KB' );
		expect( formatStorage( 1023.99 * MB ) ).toBe( '1,024.0 MB' );
		expect( formatStorage( 1024 * GB ) ).toBe( '1.0 TB' );
	} );

	test( 'accepts a decimals override', () => {
		expect( formatStorage( 3 * GB, 0 ) ).toBe( '3 GB' );
	} );
} );

describe( 'getStorageUsagePercent', () => {
	test( 'rounds to a whole percent like wp-admin', () => {
		expect(
			getStorageUsagePercent( { storage_used_bytes: 573_175_398, max_storage_bytes: 3.1 * GB } )
		).toBe( 17 );
		expect( getStorageUsagePercent( { storage_used_bytes: 50, max_storage_bytes: 100 } ) ).toBe(
			50
		);
	} );
} );
