#!/usr/bin/env node

// `afterPack` hook for electron-builder. Signs the packed binaries it won't:
// *.node/*.dll (never routed through `win.sign`) and nested *.exe (its
// asar:false signApp signs only the top-level app exe). The top-level exe is
// left to electron-builder — signing it here would corrupt its rcedit+sign pass.

const { signPackagedBinaries } = require( './windows-signing-core' );

module.exports = async function ( context ) {
	// Gate to CI Windows builds: matches the win.sign callback, and keeps local
	// dev / Mac / Linux packing untouched.
	if ( context.electronPlatformName !== 'win32' || ! process.env.CI ) {
		return;
	}
	await signPackagedBinaries( context.appOutDir );
};
