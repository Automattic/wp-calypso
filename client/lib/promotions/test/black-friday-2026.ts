import config from '@automattic/calypso-config';
import {
	BLACK_FRIDAY_2026_END,
	BLACK_FRIDAY_2026_START,
	isBlackFriday2026Active,
} from '../black-friday-2026';

jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn();
	return {
		__esModule: true,
		default: Object.assign( mockConfig, { isEnabled: jest.fn() } ),
	};
} );

describe( 'isBlackFriday2026Active', () => {
	beforeEach( () => {
		( config as unknown as jest.Mock ).mockImplementation( ( key: string ) =>
			key === 'env' ? 'production' : undefined
		);
		( config.isEnabled as jest.Mock ).mockImplementation(
			( flag: string ) => flag === 'black-friday-2026'
		);
	} );

	it( 'is active inside the window', () => {
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_START ) ).toBe( true );
		expect( isBlackFriday2026Active( Date.UTC( 2026, 10, 28, 12 ) ) ).toBe( true );
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_END - 1 ) ).toBe( true );
	} );

	it( 'is inactive before the window', () => {
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_START - 1 ) ).toBe( false );
	} );

	it( 'is inactive after the window', () => {
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_END ) ).toBe( false );
	} );

	it( 'is inactive inside the window when the flag is off', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( false );
		expect( isBlackFriday2026Active( Date.UTC( 2026, 10, 28, 12 ) ) ).toBe( false );
	} );

	it( 'is active outside the window when the flag is on in development', () => {
		( config as unknown as jest.Mock ).mockImplementation( ( key: string ) =>
			key === 'env' ? 'development' : undefined
		);
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_START - 1 ) ).toBe( true );
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_END ) ).toBe( true );
	} );
} );
