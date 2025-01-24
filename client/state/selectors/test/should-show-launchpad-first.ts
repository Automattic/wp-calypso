import config from '@automattic/calypso-config';
import { shouldShowLaunchpadFirst } from '../should-show-launchpad-first';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

describe( 'shouldShowLaunchpadFirst', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return true when site was created via onboarding flow and feature flag is enabled', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
			},
		};

		expect( shouldShowLaunchpadFirst( site ) ).toBe( true );
	} );

	it( 'should return false when site was created via onboarding flow but feature flag is disabled', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( false );
		const site = {
			options: {
				site_creation_flow: 'onboarding',
			},
		};

		expect( shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site was not created via onboarding flow', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		const site = {
			options: {
				site_creation_flow: 'other',
			},
		};

		expect( shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );

	it( 'should return false when site has no creation flow information', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		const site = {
			options: {},
		};

		expect( shouldShowLaunchpadFirst( site ) ).toBe( false );
	} );
} );
