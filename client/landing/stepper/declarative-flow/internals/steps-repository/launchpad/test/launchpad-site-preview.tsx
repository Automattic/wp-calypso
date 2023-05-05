import { NEWSLETTER_FLOW, START_WRITING_FLOW } from '@automattic/onboarding';
import { getEnableEditOverlay } from '../launchpad-site-preview';

describe( 'getEnableEditOverlay', () => {
	test( 'should return false if flow is a newsletter flow', () => {
		const flow = NEWSLETTER_FLOW;
		expect( getEnableEditOverlay( flow ) ).toBe( false );
	} );

	test( 'should return false if flow is a start writing flow', () => {
		const flow = START_WRITING_FLOW;
		expect( getEnableEditOverlay( flow ) ).toBe( false );
	} );

	test( 'default return true if flow is not specified or null', () => {
		const flow = 'nonexistent-flow';
		expect( getEnableEditOverlay( null ) ).toBe( true );
		expect( getEnableEditOverlay( flow ) ).toBe( true );
	} );
} );
