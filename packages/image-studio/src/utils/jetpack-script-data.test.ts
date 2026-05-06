import { getReelSharePostPath } from './jetpack-script-data';

const originalScriptData = ( window as unknown as { JetpackScriptData?: unknown } )
	.JetpackScriptData;

function setScriptData( value: unknown ): void {
	( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = value;
}

afterEach( () => {
	setScriptData( originalScriptData );
} );

describe( 'getReelSharePostPath', () => {
	it( 'returns null when window.JetpackScriptData is undefined', () => {
		setScriptData( undefined );
		expect( getReelSharePostPath() ).toBeNull();
	} );

	it( 'returns null when social.api_paths.resharePost is missing', () => {
		setScriptData( { social: { api_paths: {} } } );
		expect( getReelSharePostPath() ).toBeNull();
	} );

	it( 'returns the resharePost path string when present', () => {
		setScriptData( {
			social: { api_paths: { resharePost: '/wpcom/v2/publicize/share-post/{postId}' } },
		} );
		expect( getReelSharePostPath() ).toBe( '/wpcom/v2/publicize/share-post/{postId}' );
	} );

	it( 'returns null when the path is a non-string value', () => {
		setScriptData( { social: { api_paths: { resharePost: 42 } } } );
		expect( getReelSharePostPath() ).toBeNull();
	} );
} );
