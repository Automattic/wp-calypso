#!/usr/bin/env node

// `win.sign` callback for electron-builder. Invoked for every Windows .exe (the
// app exe, nested exes, and the NSIS installer). Signs via Azure.

const { resolveSigner, signFile } = require( './windows-signing-core' );

module.exports = async function ( configuration ) {
	// electron-builder iterates its default sha1 + sha256 hashes and calls this
	// once per hash. Azure Artifact Signing is SHA256-only, so skip the sha1 pass.
	if ( configuration.hash === 'sha1' ) {
		console.log( `[windows-sign] Skipping ${ configuration.path } for SHA1 (SHA256-only)` );
		return;
	}
	await signFile( resolveSigner(), configuration.path );
};
