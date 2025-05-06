import { exec as _exec } from 'node:child_process';
import { createWriteStream, constants as fsConstants } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import util from 'node:util';
const promiseExec = util.promisify( _exec );

const exec = async ( cmd, opts ) => {
	return promiseExec( cmd, {
		encoding: 'UTF-8',
		stdio: 'inherit',
		...opts,
	} );
};

export default async function didCalypsoAppChange( { slug, dir, artifactDir } ) {
	await downloadPrevBuild( slug, dir );
	const prevReleaseDir = path.join( dir, 'prev-release' );

	const normalizer = path.join( dir, 'bin/normalize-artifact.sh' );
	try {
		await access( normalizer, fsConstants.X_OK );
		await exec( normalizer, { cwd: prevReleaseDir } );
		console.info( `Successfully normalized ${ slug }.` );
	} catch ( e ) {
		if ( e.code !== 'ENOENT' ) {
			// ENOENT is expected for many apps which don't need this functionality.
			console.error( e );
		}
	}

	try {
		await exec(
			`diff -r --exclude="*.js.map" --exclude="*.asset.php" --exclude="build_meta.json" --exclude="README.md" ${ artifactDir } ${ prevReleaseDir }`,
			{ cwd: dir, maxBuffer: 1024 * 1024 * 32 } // 32MB buffer for large diffs.
		);
		return false;
	} catch ( { code, stdout, stderr } ) {
		if ( code === 1 ) {
			console.info( `The build for ${ slug } changed. Cause:` );
			console.info( stdout );
			return true;
		}
		throw new Error( `Unexpected error code ${ code } while diffing ${ slug } build: ${ stderr }` );
	}
}

async function downloadPrevBuild( appSlug, dir ) {
	const prevBuildZip = `${ dir }/prev-archive-download.zip`;
	const stream = createWriteStream( prevBuildZip );

	const prevBuildUrl = `${ process.env.tc_sever_url }/repository/download/calypso_calypso_WPComPlugins_Build_Plugins/${ appSlug }-release-build.tcbuildtag/${ appSlug }.zip?guest=1&branch=trunk`;
	console.info( `Fetching previous release build for ${ appSlug } from ${ prevBuildUrl }` );

	const { body, status } = await fetch( prevBuildUrl );
	if ( status !== 200 ) {
		throw new Error(
			`Could not fetch previous build for ${ appSlug } (response code ${ status })! You can ignore this error when first adding a new app — just add a \`teamcity:build-app\` package script so it's ready for subsequent PRs, and add your app to the \`keepReleaseBuilds\` and \`artifactRules\` lists in \`.teamcity/_self/projects/WPComPlugins.kt\`.`
		);
	}

	console.info( `Extracting downloaded archive for ${ appSlug }...` );
	await finished( Readable.fromWeb( body ).pipe( stream ) );
	await exec( `unzip -q ${ prevBuildZip } -d ${ dir }/prev-release` );
}
