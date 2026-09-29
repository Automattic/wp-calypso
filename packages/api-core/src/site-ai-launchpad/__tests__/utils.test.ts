import { getAiLaunchpadStatus, isLaunchpadNoGuidance } from '../utils';

const admin = { manage_options: true };

describe( 'isLaunchpadNoGuidance', () => {
	it( 'is true when no_guidance option is set', () => {
		expect( isLaunchpadNoGuidance( { options: { wpcom_ai_launchpad_no_guidance: true } } ) ).toBe(
			true
		);
	} );

	it( 'is true when enabled and dismissed', () => {
		expect(
			isLaunchpadNoGuidance( {
				options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_dismissed: true },
			} )
		).toBe( true );
	} );

	it( 'is false when dismissed only', () => {
		expect( isLaunchpadNoGuidance( { options: { wpcom_ai_launchpad_dismissed: true } } ) ).toBe(
			false
		);
	} );

	it( 'is false when enabled only', () => {
		expect( isLaunchpadNoGuidance( { options: { wpcom_ai_launchpad_enabled: true } } ) ).toBe(
			false
		);
	} );

	it( 'is false when no options', () => {
		expect( isLaunchpadNoGuidance( { options: {} } ) ).toBe( false );
		expect( isLaunchpadNoGuidance( {} ) ).toBe( false );
	} );
} );

describe( 'getAiLaunchpadStatus', () => {
	it( 'is active when enabled', () => {
		expect(
			getAiLaunchpadStatus( { capabilities: admin, options: { wpcom_ai_launchpad_enabled: true } } )
		).toBe( 'active' );
	} );

	it( 'is null when no-guidance wins over enabled', () => {
		expect(
			getAiLaunchpadStatus( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_no_guidance: true },
			} )
		).toBeNull();
	} );
} );
