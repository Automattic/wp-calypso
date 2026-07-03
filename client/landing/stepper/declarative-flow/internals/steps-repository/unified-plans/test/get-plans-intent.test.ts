/**
 * @jest-environment jsdom
 */
import { getPlansIntent } from '../util/get-plans-intent';

describe( 'getPlansIntent', () => {
	it( 'maps the ai-site-builder-onboarding flow to the four paid plans intent', () => {
		expect( getPlansIntent( 'ai-site-builder-onboarding' ) ).toBe( 'plans-ai-assembler-paid-only' );
	} );
} );
