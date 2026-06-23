// Shared Windows code-signing helpers for the Buildkite NSIS build.

const { spawn } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );

// Azure Artifact Signing is SHA256-only. The PFX path matches it so both modes
// emit a single SHA256 signature.
const FILE_DIGEST = 'SHA256';
const TIMESTAMP_DIGEST = 'SHA256';

// HTTPS against the Azure timestamp endpoint currently fails; HTTP is the
// working protocol (Beeper hit the same, AINFRA-2275).
const AZURE_TIMESTAMP_SERVER = 'http://timestamp.acs.microsoft.com';
const PFX_TIMESTAMP_SERVER = 'http://timestamp.sectigo.com';

// Native modules electron-builder never signs — Smart App Control blocks an app
// that loads unsigned ones — so afterPack signs these at every depth.
const NATIVE_BINARY_EXTENSIONS = new Set( [ '.node', '.dll' ] );

// Resolve the active signer from the environment, or throw naming exactly what
// is missing. Azure takes precedence; the PFX fallback engages only when no
// Azure env is present. A partially-configured mode is an error, not a reason
// to fall through to the other.
function resolveSigner( env = process.env ) {
	const azureIntended = !! ( env.AZURE_CODE_SIGNING_DLIB || env.AZURE_METADATA_JSON );
	const pfxIntended = !! ( env.WIN_CSC_LINK || env.WIN_CSC_KEY_PASSWORD );

	if ( azureIntended ) {
		const missing = [ 'AZURE_CODE_SIGNING_DLIB', 'AZURE_METADATA_JSON', 'SIGNTOOL_PATH' ].filter(
			( name ) => ! env[ name ]
		);
		if ( missing.length ) {
			throw new Error(
				`Azure Artifact Signing selected but missing: ${ missing.join(
					', '
				) }. Did setup_azure_trusted_signing.ps1 run?`
			);
		}
		return {
			kind: 'azure',
			signtoolPath: env.SIGNTOOL_PATH,
			dlib: env.AZURE_CODE_SIGNING_DLIB,
			metadata: env.AZURE_METADATA_JSON,
			timestampServer: env.AZURE_TIMESTAMP_SERVER || AZURE_TIMESTAMP_SERVER,
		};
	}

	if ( pfxIntended ) {
		const missing = [ 'WIN_CSC_LINK', 'WIN_CSC_KEY_PASSWORD', 'SIGNTOOL_PATH' ].filter(
			( name ) => ! env[ name ]
		);
		if ( missing.length ) {
			throw new Error( `PFX fallback selected but missing: ${ missing.join( ', ' ) }.` );
		}
		return {
			kind: 'pfx',
			signtoolPath: env.SIGNTOOL_PATH,
			pfx: env.WIN_CSC_LINK,
			password: env.WIN_CSC_KEY_PASSWORD,
			timestampServer: env.PFX_TIMESTAMP_SERVER || PFX_TIMESTAMP_SERVER,
		};
	}

	throw new Error(
		'No Windows signing configuration found: set Azure (AZURE_CODE_SIGNING_DLIB, AZURE_METADATA_JSON, SIGNTOOL_PATH) or PFX (WIN_CSC_LINK, WIN_CSC_KEY_PASSWORD, SIGNTOOL_PATH) env vars.'
	);
}

function buildSignToolArgs( signer, file ) {
	const common = [
		'sign',
		'/v',
		// /debug surfaces Azure.CodeSigning.Dlib diagnostics (account/cert
		// selection, token acquisition, timestamp round-trips); without it a
		// remote failure collapses to a generic "SignTool Error".
		'/debug',
		'/fd',
		FILE_DIGEST,
		'/tr',
		signer.timestampServer,
		'/td',
		TIMESTAMP_DIGEST,
	];

	if ( signer.kind === 'azure' ) {
		return [ ...common, '/dlib', signer.dlib, '/dmdf', signer.metadata, file ];
	}
	return [ ...common, '/f', signer.pfx, '/p', signer.password, file ];
}

function signFile( signer, file ) {
	const args = buildSignToolArgs( signer, file );
	console.log( `[windows-sign] Signing (${ signer.kind }) ${ file }` );

	return new Promise( ( resolve, reject ) => {
		const proc = spawn( signer.signtoolPath, args, { stdio: 'inherit' } );
		proc.on( 'error', ( err ) =>
			reject( new Error( `signtool spawn failed for ${ file }: ${ err.message }` ) )
		);
		proc.on( 'exit', ( code, signal ) => {
			if ( signal ) {
				reject( new Error( `signtool killed by signal ${ signal } for ${ file }` ) );
			} else if ( code !== 0 ) {
				reject( new Error( `signtool failed for ${ file } (exit ${ code })` ) );
			} else {
				resolve();
			}
		} );
	} );
}

function collectSignableBinaries( dir, rootDir = dir, acc = [] ) {
	for ( const entry of fs.readdirSync( dir, { withFileTypes: true } ) ) {
		const full = path.join( dir, entry.name );
		// Skip symlinks to avoid following workspace links / cycles; the packaged
		// output dereferences them, so real binaries are still visited.
		if ( entry.isSymbolicLink() ) {
			continue;
		}
		if ( entry.isDirectory() ) {
			collectSignableBinaries( full, rootDir, acc );
		} else if ( entry.isFile() ) {
			const ext = path.extname( entry.name ).toLowerCase();
			// Take *.exe only below the top level. electron-builder signs the
			// top-level app exe itself (rcedit then signtool); pre-signing it here
			// breaks that pass — rcedit rewrites resources on the already-signed PE
			// and signtool then rejects it with 0x800700C1 (bad exe format). Its
			// asar:false signApp never reaches nested exes, so those are ours.
			if ( NATIVE_BINARY_EXTENSIONS.has( ext ) ) {
				acc.push( full );
			} else if ( ext === '.exe' && dir !== rootDir ) {
				acc.push( full );
			}
		}
	}
	return acc;
}

async function signPackagedBinaries( appOutDir, env = process.env ) {
	const signer = resolveSigner( env );
	const binaries = collectSignableBinaries( appOutDir );
	if ( binaries.length === 0 ) {
		console.log(
			`[windows-sign] No signable binaries (*.exe, *.node, *.dll) under ${ appOutDir }`
		);
		return;
	}
	console.log(
		`[windows-sign] Signing ${ binaries.length } packed binaries (*.exe, *.node, *.dll) under ${ appOutDir }`
	);
	for ( const binary of binaries ) {
		await signFile( signer, binary );
	}
}

module.exports = {
	resolveSigner,
	buildSignToolArgs,
	signFile,
	signPackagedBinaries,
	collectSignableBinaries,
};
