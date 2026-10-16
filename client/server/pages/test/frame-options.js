import { getFrameHeaders } from '../frame-options';

const GENERATION_SCREEN = '/setup/ai-site-builder-spec/site-generation';

describe( 'getFrameHeaders', () => {
	it( 'lets a local page frame the generation screen in development', () => {
		const headers = getFrameHeaders( {
			env: 'development',
			nodeEnv: 'development',
			path: GENERATION_SCREEN,
		} );

		expect( headers[ 'X-Frame-Options' ] ).toBeUndefined();
		expect( headers[ 'Content-Security-Policy' ] ).toBe(
			"frame-ancestors 'self' http://localhost:* http://127.0.0.1:* http://*.localhost:*"
		);
	} );

	it( 'keeps every other page same-origin in development', () => {
		for ( const path of [ '/setup/onboarding/domains', '/', `${ GENERATION_SCREEN }/extra` ] ) {
			expect( getFrameHeaders( { env: 'development', nodeEnv: 'development', path } ) ).toEqual( {
				'X-Frame-Options': 'SAMEORIGIN',
			} );
		}
	} );

	it.each( [ 'wpcalypso', 'horizon', 'stage', 'production', 'test' ] )(
		'keeps the generation screen same-origin in %s',
		( env ) => {
			expect( getFrameHeaders( { env, nodeEnv: 'development', path: GENERATION_SCREEN } ) ).toEqual(
				{ 'X-Frame-Options': 'SAMEORIGIN' }
			);
		}
	);

	it.each( [ 'production', 'test', undefined ] )(
		'keeps the generation screen same-origin when the build mode is %s',
		( nodeEnv ) => {
			expect( getFrameHeaders( { env: 'development', nodeEnv, path: GENERATION_SCREEN } ) ).toEqual(
				{ 'X-Frame-Options': 'SAMEORIGIN' }
			);
		}
	);
} );
