import { getLegacyHostingFlowRedirect } from '../legacy-hosting-flow';

describe( 'getLegacyHostingFlowRedirect', () => {
	it( 'keeps the step, locale and query', () => {
		expect( getLegacyHostingFlowRedirect( '/start/hosting?ref=email' ) ).toBe(
			'/start/hosting-start?ref=email'
		);
		expect( getLegacyHostingFlowRedirect( '/start/hosting/user/es?ref=email' ) ).toBe(
			'/start/hosting-start/user/es?ref=email'
		);
	} );
} );
