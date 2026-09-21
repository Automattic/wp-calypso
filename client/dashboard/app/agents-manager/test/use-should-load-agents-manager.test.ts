/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { shouldLoadAgentsManager } from '../use-should-load-agents-manager';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockedIsEnabled = jest.mocked( isEnabled );

describe( 'shouldLoadAgentsManager', () => {
	beforeEach( () => {
		mockedIsEnabled.mockReturnValue( true );
	} );

	it.each( [ '/sites/example.wordpress.com', '/sites/example.com/' ] )(
		'loads Agents Manager on a site overview at %s',
		( pathname ) => {
			expect( shouldLoadAgentsManager( pathname ) ).toBe( true );
		}
	);

	it.each( [ '/sites', '/sites/example.com/domains', '/me', '/' ] )(
		'does not load Agents Manager at %s',
		( pathname ) => {
			expect( shouldLoadAgentsManager( pathname ) ).toBe( false );
		}
	);

	it( 'does not load Agents Manager when the feature is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );

		expect( shouldLoadAgentsManager( '/sites/example.com' ) ).toBe( false );
	} );
} );
