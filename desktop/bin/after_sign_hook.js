#!/usr/bin/env node

const path = require( 'path' );
const { notarize } = require( 'electron-notarize' );

const APP_ID = 'com.automattic.wordpress';
const NOTARIZATION_ASC_PROVIDER = 'AutomatticInc';
const NOTARIZATION_ID = process.env.NOTARIZATION_ID;
const NOTARIZATION_PWD = process.env.NOTARIZATION_PWD;

const shouldNotarize = process.platform === 'darwin' && !! process.env.CIRCLE_TAG;

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

	const app = path.join( context.appOutDir, `${ context.packager.appInfo.productFilename }.app` );
	const appName = path.basename( app );

	const start = new Date();
	console.log( `  • notarizing ${ appName }...` );
	await notarize( {
		appBundleId: APP_ID,
		appPath: app,
		appleId: NOTARIZATION_ID,
		appleIdPassword: NOTARIZATION_PWD,
		ascProvider: NOTARIZATION_ASC_PROVIDER,
	} );
	console.log( `  • done notarizing ${ appName }, took ${ elapsed( start ) }` );
};
