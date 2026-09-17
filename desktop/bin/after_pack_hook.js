#!/usr/bin/env node

// `afterPack` hook for electron-builder. Signs the packaged native binaries
// (*.node, *.dll) that the `win.sign` callback never sees because electron-builder
// routes only *.exe through it. Runs before the app exe and installer are
// signed, so the whole tree is covered by the time the installer is built.

const { signNativeBinaries } = require( './windows-signing-core' );

module.exports = async function ( context ) {
	// Gate to CI Windows builds: matches the win.sign callback, and keeps local
	// dev / Mac / Linux packing untouched.
	if ( context.electronPlatformName !== 'win32' || ! process.env.CI ) {
		return;
	}
	await signNativeBinaries( context.appOutDir );
};
