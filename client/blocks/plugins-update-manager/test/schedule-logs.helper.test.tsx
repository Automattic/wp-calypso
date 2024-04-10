import { addSecondsToFormat } from '../schedule-logs.helper';

describe( 'Schedule logs helpers', () => {
	test( 'addSecondsToFormat', () => {
		expect( addSecondsToFormat( 'h:mm' ) ).toBe( 'h:mm:ss' );
		expect( addSecondsToFormat( 'h:mm a' ) ).toBe( 'h:mm:ss a' );
		expect( addSecondsToFormat( 'h:mm:ss' ) ).toBe( 'h:mm:ss' );
		expect( addSecondsToFormat( 'h:mm:ss a' ) ).toBe( 'h:mm:ss a' );
		expect( addSecondsToFormat( 'h:mm a z' ) ).toBe( 'h:mm:ss a z' );
		expect( addSecondsToFormat( 'h:mm:ss a z' ) ).toBe( 'h:mm:ss a z' );
		expect( addSecondsToFormat( 'h:mm z' ) ).toBe( 'h:mm:ss z' );
		expect( addSecondsToFormat( 'HH:mm' ) ).toBe( 'HH:mm:ss' );
		expect( addSecondsToFormat( 'HH:mm:ss' ) ).toBe( 'HH:mm:ss' );
	} );
} );
