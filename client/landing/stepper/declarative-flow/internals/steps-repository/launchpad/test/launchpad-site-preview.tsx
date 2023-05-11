import { NEWSLETTER_FLOW, START_WRITING_FLOW } from '@automattic/onboarding';
import { getEnableEditOverlay } from '../launchpad-site-preview';

describe( 'getEnableEditOverlay', () => {
	test( 'should return false if flow is a newsletter flow', () => {
		const flow = NEWSLETTER_FLOW;
		const isFSETheme = true;
		expect( getEnableEditOverlay( flow, isFSETheme ) ).toBe( false );
	} );

	test( 'should return false if flow is a start writing flow', () => {
		const flow = START_WRITING_FLOW;
		const isFSETheme = true;
		expect( getEnableEditOverlay( flow, isFSETheme ) ).toBe( false );
	} );

	test( 'should return false if theme is not FSE enabled', () => {
		const isFSETheme = false;
		expect( getEnableEditOverlay( null, isFSETheme ) ).toBe( false );
	} );

	test( 'default return true if flow is not specified or null', () => {
		const flow = 'nonexistent-flow';
		const isFSETheme = true;
		expect( getEnableEditOverlay( null, isFSETheme ) ).toBe( true );
		expect( getEnableEditOverlay( flow, isFSETheme ) ).toBe( true );
	} );
} );
