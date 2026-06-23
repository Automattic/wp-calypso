#!/usr/bin/env node

// electron-builder `win.sign` callback. Invoked for every Windows .exe (the
// app exe, nested exes, and the NSIS installer). Signs via Azure Trusted
// Signing by default, falling back to the org PFX when no Azure env is present.

const { resolveSigner, signFile } = require( './windows-signing-core' );

module.exports = async function ( configuration ) {
	// electron-builder iterates its default sha1 + sha256 hashes and calls this
	// once per hash. Azure Trusted Signing is SHA256-only, so skip the sha1 pass.
	if ( configuration.hash === 'sha1' ) {
		console.log( `[windows-sign] Skipping ${ configuration.path } for SHA1 (SHA256-only)` );
		return;
	}
	await signFile( resolveSigner(), configuration.path );
};
