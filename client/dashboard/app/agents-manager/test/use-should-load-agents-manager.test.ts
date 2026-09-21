/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import useShouldLoadAgentsManager, {
	shouldLoadAgentsManager,
} from '../use-should-load-agents-manager';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockedIsEnabled = jest.mocked( isEnabled );

describe( 'useShouldLoadAgentsManager', () => {
	beforeEach( () => {
		mockedIsEnabled.mockReturnValue( true );
	} );

	it.each( [ '/sites/example.wordpress.com', '/sites/example.com/' ] )(
		'loads Agents Manager on a site overview at %s',
		( currentRoute ) => {
			const { result } = renderHook( () => useShouldLoadAgentsManager( currentRoute ) );

			expect( result.current ).toBe( true );
		}
	);

	it.each( [ '/sites', '/sites/example.com/domains', '/me', '/', null, undefined ] )(
		'does not load Agents Manager at %s',
		( currentRoute ) => {
			expect( shouldLoadAgentsManager( currentRoute ) ).toBe( false );
		}
	);

	it( 'does not load Agents Manager when the feature is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );

		expect( shouldLoadAgentsManager( '/sites/example.com' ) ).toBe( false );
	} );
} );
