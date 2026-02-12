/**
 * @jest-environment jsdom
 */
import { hasExceededDormancyThreshold } from '../utils';

describe( 'hasExceededDormancyThreshold', () => {
	const now = 1_700_000_000_000;
	let dateSpy: jest.SpyInstance< number, [] >;

	beforeAll( () => {
		dateSpy = jest.spyOn( Date, 'now' ).mockReturnValue( now );
	} );

	afterAll( () => {
		dateSpy.mockRestore();
	} );

	it( 'returns false when lastSeen is missing', () => {
		expect( hasExceededDormancyThreshold( undefined, 180 ) ).toBe( false );
	} );

	it( 'returns false when day limit is invalid', () => {
		expect( hasExceededDormancyThreshold( 123, 0 ) ).toBe( false );
	} );

	it( 'returns true when lastSeen is older than the threshold', () => {
		const sixMonthsAgo = now / 1000 - 181 * 24 * 60 * 60;
		expect( hasExceededDormancyThreshold( sixMonthsAgo, 180 ) ).toBe( true );
	} );

	it( 'returns false when lastSeen is more recent than the threshold', () => {
		const oneMonthAgo = now / 1000 - 30 * 24 * 60 * 60;
		expect( hasExceededDormancyThreshold( oneMonthAgo, 180 ) ).toBe( false );
	} );
} );
