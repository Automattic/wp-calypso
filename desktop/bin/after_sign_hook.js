#!/usr/bin/env node

const { execFileSync } = require( 'child_process' );
const path = require( 'path' );
const { notarize } = require( '@electron/notarize' );

const APP_ID = 'com.automattic.wordpress';

// Notarize when explicitly requested (CI-agnostic, set by the Buildkite mac
// build) or for a legacy CircleCI tagged release. The CircleCI branch — and
// the Apple ID credentials it relies on — go away once the `wp-desktop-mac`
// CircleCI job is decommissioned.
//
// Running here, in electron-builder's afterSign hook, is deliberate: the app
// is notarized and stapled *before* the `.zip` and `.dmg` are packaged from
// it, so both distributables carry a stapled, offline-verifiable app. (The
// fastlane `notarize_app` lane runs post-build and can only staple the `.dmg`
// wrapper, not the already-zipped app.)
const circleTag = process.env.CIRCLE_TAG;
const isCircleRelease = !! circleTag && circleTag.startsWith( 'desktop-v' );
const shouldNotarize =
	process.platform === 'darwin' && ( process.env.NOTARIZE === 'true' || isCircleRelease );

// App Store Connect API key (notarytool). The standard a8c flow, sharing the
// key fastlane match already uses. `*_PATH` points at a `.p8` materialized by
// the CI build script.
const ascApiKeyPath = process.env.APP_STORE_CONNECT_API_KEY_PATH;
const ascApiKeyId = process.env.APP_STORE_CONNECT_API_KEY_KEY_ID;
const ascApiIssuer = process.env.APP_STORE_CONNECT_API_KEY_ISSUER_ID;

function elapsed( start ) {
	const now = new Date();

	const ms = Math.abs( now.getTime() - start.getTime() );
	const diff = new Date( ms );

	return `${ diff.getMinutes() } minutes, ${ diff.getSeconds() } seconds`;
}

module.exports = async function ( context ) {
	if ( ! shouldNotarize ) {
		return;
	}

	const arch = context.appOutDir.includes( 'arm64' ) ? 'arm64' : 'x64';
	const app = path.join( context.appOutDir, `${ context.packager.appInfo.productFilename }.app` );
	const appName = path.basename( app );

	const start = new Date();
	console.log( `  • notarizing ${ appName } (${ arch })...` );

	if ( ascApiKeyPath ) {
		await notarize( {
			appPath: app,
			appleApiKey: ascApiKeyPath,
			appleApiKeyId: ascApiKeyId,
			appleApiIssuer: ascApiIssuer,
		} );
	} else {
		// Legacy CircleCI Apple ID flow. Removed with the CircleCI mac job.
		await notarize( {
			appBundleId: APP_ID,
			appPath: app,
			appleId: process.env.WPDESKTOP_NOTARIZATION_ID,
			appleIdPassword: process.env.WPDESKTOP_NOTARIZATION_PWD,
			teamId: process.env.APPLE_DEVELOPER_SHORT_NAME,
		} );
	}

	// `@electron/notarize` submits and waits, but does not staple. Staple the
	// ticket onto the `.app` so it verifies offline — and so the `.zip`/`.dmg`
	// packaged from it carry the stapled app.
	console.log( `  • stapling ${ appName } (${ arch })...` );
	execFileSync( 'xcrun', [ 'stapler', 'staple', app ], { stdio: 'inherit' } );

	console.log( `  • done notarizing ${ appName } ( ${ arch } ), took ${ elapsed( start ) }` );
};
