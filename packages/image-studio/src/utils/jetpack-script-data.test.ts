import { getReelSharePostPath } from './jetpack-script-data';

describe( 'getReelSharePostPath', () => {
	const originalScriptData = ( window as unknown as { JetpackScriptData?: unknown } )
		.JetpackScriptData;

	afterEach( () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = originalScriptData;
	} );

	it( 'returns null when window.JetpackScriptData is undefined', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = undefined;
		expect( getReelSharePostPath() ).toBeNull();
	} );

	it( 'returns null when social.api_paths.resharePost is missing', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = {
			social: { api_paths: {} },
		};
		expect( getReelSharePostPath() ).toBeNull();
	} );

	it( 'returns the resharePost path string when present', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = {
			social: { api_paths: { resharePost: '/wpcom/v2/publicize/share-post/{postId}' } },
		};
		expect( getReelSharePostPath() ).toBe( '/wpcom/v2/publicize/share-post/{postId}' );
	} );

	it( 'returns null when the path is a non-string value', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = {
			social: { api_paths: { resharePost: 42 } },
		};
		expect( getReelSharePostPath() ).toBeNull();
	} );
} );
