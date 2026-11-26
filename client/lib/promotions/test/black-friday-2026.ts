import config from '@automattic/calypso-config';
import { type Mock, vi } from 'vitest';
import {
	BLACK_FRIDAY_2026_END,
	BLACK_FRIDAY_2026_START,
	isBlackFriday2026Active,
} from '../black-friday-2026';

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: Object.assign( vi.fn(), { isEnabled: vi.fn() } ),
} ) );

describe( 'isBlackFriday2026Active', () => {
	beforeEach( () => {
		( config.isEnabled as Mock ).mockReturnValue( false );
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

	it( 'is active outside the window when the flag is on', () => {
		( config.isEnabled as Mock ).mockImplementation(
			( flag: string ) => flag === 'black-friday-2026'
		);
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_START - 1 ) ).toBe( true );
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_END ) ).toBe( true );
	} );
} );
