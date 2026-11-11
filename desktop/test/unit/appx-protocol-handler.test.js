const Config = require( '../../app/lib/config' );
const appxConfig = require( '../../electron-builder-appx.json' );

// A Microsoft Store build cannot register its protocol handler at runtime the way the
// direct-download build does: Windows only honors what AppxManifest.xml declares, and
// electron-builder generates that from `protocols`. Losing the entry silently breaks
// OAuth login for every Store user (DOTAPP-12), so pin it to the scheme the app listens for.
describe( 'Store appx protocol handler', () => {
	it( 'declares the scheme the app listens for', () => {
		const schemes = ( appxConfig.protocols ?? [] ).flatMap( ( protocol ) => protocol.schemes );
		expect( schemes ).toContain( Config.protocol );
	} );
} );
