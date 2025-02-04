#!/usr/bin/env node

const path = require( 'path' );
const { notarize } = require( '@electron/notarize' );

const APP_ID = 'com.automattic.wordpress';
const NOTARIZATION_ID = process.env.WPDESKTOP_NOTARIZATION_ID;
const NOTARIZATION_PWD = process.env.WPDESKTOP_NOTARIZATION_PWD;
const NOTARIZATION_ASC_PROVIDER = process.env.APPLE_DEVELOPER_SHORT_NAME;

const circleTag = process.env.CIRCLE_TAG;
const shouldNotarize =
	process.platform === 'darwin' && !! circleTag && circleTag.startsWith( 'desktop-v' );

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
	await notarize( {
		appBundleId: APP_ID,
		appPath: app,
		appleId: NOTARIZATION_ID,
		appleIdPassword: NOTARIZATION_PWD,
		ascProvider: NOTARIZATION_ASC_PROVIDER,
		teamId: NOTARIZATION_ASC_PROVIDER,
	} );
	console.log( `  • done notarizing ${ appName } ( ${ arch } ), took ${ elapsed( start ) }` );
};
