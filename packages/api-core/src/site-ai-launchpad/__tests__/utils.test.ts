import { getAiLaunchpadStatus, isLaunchpadNoGuidance } from '../utils';

const admin = { manage_options: true };

describe( 'isLaunchpadNoGuidance', () => {
	it( 'is true when no_guidance option is set', () => {
		expect(
			isLaunchpadNoGuidance( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_no_guidance: true },
			} )
		).toBe( true );
	} );

	it( 'is true when enabled and dismissed', () => {
		expect(
			isLaunchpadNoGuidance( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_dismissed: true },
			} )
		).toBe( true );
	} );

	it( 'is false when dismissed only', () => {
		expect(
			isLaunchpadNoGuidance( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_dismissed: true },
			} )
		).toBe( false );
	} );

	it( 'is false when enabled only', () => {
		expect(
			isLaunchpadNoGuidance( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_enabled: true },
			} )
		).toBe( false );
	} );

	it( 'is false when no options', () => {
		expect( isLaunchpadNoGuidance( { capabilities: admin, options: {} } ) ).toBe( false );
		expect( isLaunchpadNoGuidance( { capabilities: admin } ) ).toBe( false );
	} );

	it( 'is false for non-administrators', () => {
		const options = { wpcom_ai_launchpad_no_guidance: true };
		expect( isLaunchpadNoGuidance( { capabilities: { manage_options: false }, options } ) ).toBe(
			false
		);
		expect( isLaunchpadNoGuidance( { options } ) ).toBe( false );
	} );
} );

describe( 'getAiLaunchpadStatus', () => {
	it( 'is active when enabled', () => {
		expect(
			getAiLaunchpadStatus( { capabilities: admin, options: { wpcom_ai_launchpad_enabled: true } } )
		).toBe( 'active' );
	} );

	it( 'is completed when enabled and completed', () => {
		expect(
			getAiLaunchpadStatus( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_completed: true },
			} )
		).toBe( 'completed' );
	} );

	it( 'is null when not enabled', () => {
		expect( getAiLaunchpadStatus( { capabilities: admin, options: {} } ) ).toBeNull();
	} );

	it( 'is null when dismissed', () => {
		expect(
			getAiLaunchpadStatus( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_dismissed: true },
			} )
		).toBeNull();
	} );

	it( 'is null when no-guidance wins over enabled', () => {
		expect(
			getAiLaunchpadStatus( {
				capabilities: admin,
				options: { wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_no_guidance: true },
			} )
		).toBeNull();
	} );

	it( 'is null for non-administrators', () => {
		expect(
			getAiLaunchpadStatus( {
				capabilities: { manage_options: false },
				options: { wpcom_ai_launchpad_enabled: true },
			} )
		).toBeNull();
	} );
} );
