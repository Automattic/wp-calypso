import { LAUNCH_SITE_FLOW } from '@automattic/onboarding';
import { shouldUseStepContainerV2 } from '../should-use-step-container-v2';

describe( 'shouldUseStepContainerV2', () => {
	it( 'renders the launch-site flow with the V2 layout', () => {
		expect( shouldUseStepContainerV2( LAUNCH_SITE_FLOW ) ).toBe( true );
	} );
} );
