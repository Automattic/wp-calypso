/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { hasChosenBeforeConnecting } from '../gate';

// The real default export is callable *and* carries `isEnabled`, which modules pulled in by
// this file's import graph call at load time. A plain mock function breaks them.
jest.mock( '@automattic/calypso-config', () => {
	const isEnabled = jest.fn( () => false );
	const configFn = Object.assign( jest.fn(), { isEnabled } );
	return { __esModule: true, default: configFn, isEnabled };
} );

const mockConfig = config as unknown as jest.Mock;

describe( 'hasChosenBeforeConnecting', () => {
	afterEach( () => mockConfig.mockReset() );

	it( 'suppresses the grid once a plan was picked before connecting', () => {
		mockConfig.mockReturnValue( true );

		expect( hasChosenBeforeConnecting() ).toBe( true );
	} );

	it( 'shows the grid to a site that was never offered the choice', () => {
		mockConfig.mockReturnValue( false );

		expect( hasChosenBeforeConnecting() ).toBe( false );
	} );

	it( 'shows the grid when the key is missing entirely', () => {
		// A site connected by any other route runs against a payload without this key, and
		// `config()` throws rather than returning undefined in development builds.
		mockConfig.mockImplementation( () => {
			throw new ReferenceError( 'Could not find config value' );
		} );

		expect( hasChosenBeforeConnecting() ).toBe( false );
	} );

	it( 'reads the key the site actually ships', () => {
		mockConfig.mockReturnValue( false );

		hasChosenBeforeConnecting();

		expect( mockConfig ).toHaveBeenCalledWith( 'stats_pricing_choice_recorded' );
	} );
} );
