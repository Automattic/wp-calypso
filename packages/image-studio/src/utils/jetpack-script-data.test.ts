import { getJetpackAdminUrl, getReelSharePostPath } from './jetpack-script-data';

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

describe( 'getJetpackAdminUrl', () => {
	it( 'concatenates path-aware admin_url with the given page slug', () => {
		setScriptData( { site: { admin_url: 'https://example.com/blog/wp-admin/' } } );
		expect( getJetpackAdminUrl( 'admin.php?page=jetpack-social' ) ).toBe(
			'https://example.com/blog/wp-admin/admin.php?page=jetpack-social'
		);
	} );

	it( 'works for installs at the domain root', () => {
		setScriptData( { site: { admin_url: 'https://example.com/wp-admin/' } } );
		expect( getJetpackAdminUrl( 'admin.php?page=jetpack-social' ) ).toBe(
			'https://example.com/wp-admin/admin.php?page=jetpack-social'
		);
	} );

	it( 'falls back to origin + /wp-admin/ when admin_url is missing', () => {
		setScriptData( { site: {} } );
		expect( getJetpackAdminUrl( 'admin.php?page=jetpack-social' ) ).toBe(
			`${ window.location.origin }/wp-admin/admin.php?page=jetpack-social`
		);
	} );

	it( 'falls back when admin_url is a non-string value', () => {
		setScriptData( { site: { admin_url: false } } );
		expect( getJetpackAdminUrl( 'admin.php?page=jetpack-social' ) ).toBe(
			`${ window.location.origin }/wp-admin/admin.php?page=jetpack-social`
		);
	} );

	it( 'falls back when JetpackScriptData is missing entirely', () => {
		setScriptData( undefined );
		expect( getJetpackAdminUrl( 'admin.php?page=jetpack-social' ) ).toBe(
			`${ window.location.origin }/wp-admin/admin.php?page=jetpack-social`
		);
	} );
} );
