#!/usr/bin/env node

// `afterPack` hook for electron-builder. Signs every packed binary (*.exe,
// *.node, *.dll) so none ship unsigned: under `asar: false` electron-builder's
// signApp signs only the top-level app exe, and it never routes *.node/*.dll
// through `win.sign`. Runs before signApp and the installer build, so the whole
// tree is covered by the time the installer is built.

const { signPackagedBinaries } = require( './windows-signing-core' );

module.exports = async function ( context ) {
	// Gate to CI Windows builds: matches the win.sign callback, and keeps local
	// dev / Mac / Linux packing untouched.
	if ( context.electronPlatformName !== 'win32' || ! process.env.CI ) {
		return;
	}
	await signPackagedBinaries( context.appOutDir );
};
