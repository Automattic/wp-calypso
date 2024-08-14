import { exec as _exec } from 'node:child_process';
import { createHmac } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import util from 'node:util';
import didCalypsoAppChange from './did-calypso-app-change.mjs';

checkEnvVars();

const exec = util.promisify( _exec );
const SKIP_BUILD_DIFF = process.env.skip_build_diff === 'true';
const IS_DEFAULT_BRANCH = process.env.is_default_branch === 'true';
const dirname = fileURLToPath( new URL( '.', import.meta.url ) );
const appRoot = path.resolve( dirname, '../apps' );

// Most apps don't need extra config, but some do. To enable slack notifications
// when a trunk build changes an app, set "slackNotify: true" for the app which
// requires it.
const APP_CONFIG = {
	'o2-blocks': {
		artifactDir: path.resolve( appRoot, 'o2-blocks/release-files' ),
	},
	'happy-blocks': {
		artifactDir: path.resolve( appRoot, 'happy-blocks/release-files' ),
	},
};

// STEP 0: Create a list of app information based on the app directories.
const apps = ( await fs.readdir( appRoot, { withFileTypes: true } ) )
	.filter( ( dirent ) => dirent.isDirectory() )
	.map( ( { name: slug } ) => ( {
		slug,
		dir: path.resolve( appRoot, slug ),
		artifactDir: path.resolve( appRoot, slug, 'dist' ),
		// Override with custom info if required.
		...( APP_CONFIG[ slug ] ?? {} ),
	} ) );

console.log( apps );

// STEP 1: Check if any apps have changed. If skipping the diff, continue as if all apps have changed.
const changedApps = SKIP_BUILD_DIFF
	? apps
	: (
			await Promise.all(
				apps.map( async ( app ) => ( ( await didCalypsoAppChange( app ) ) ? app : null ) )
			)
	  ).filter( Boolean );

if ( changedApps.length ) {
	console.info(
		'The following apps changed: ',
		changedApps.map( ( { slug } ) => slug ).join( ', ' )
	);
} else {
	console.info( 'No apps changed.' );
}

// STEP 2: Tag the build in TeamCity. This will let future builds identify the previous release.
const finalTasks = [];
if ( changedApps.length ) {
	console.info( 'Tagging build...' );
	finalTasks.push( tagBuild( changedApps ) );
}

// STEP 3: Notify the author. On trunk, send a Slack notification. On a PR, a GitHub commnent.
if ( ! IS_DEFAULT_BRANCH ) {
	console.info( 'Running GitHub comment...' );
	finalTasks.push( addGitHubComment( changedApps ) );
} else {
	console.info( 'Running Slack notification...' );
	finalTasks.push( sendSlackNotification( changedApps ) );
}

await Promise.all( finalTasks );
console.log( 'Success!' );

async function tagBuild( _changedApps ) {
	const tags = _changedApps.map( ( app ) => `${ app.slug }-release-build` );

	const tagurl = `https://teamcity.a8c.com/httpAuth/app/rest/builds/id:${ process.env.build_id }/tags/`;
	console.info( `Adding tags (${ tags }) to current build at URL ${ tagurl }` );

	const jsonTags = JSON.stringify( {
		count: tags.length,
		tag: tags.map( ( tag ) => ( {
			name: tag,
		} ) ),
	} );

	const res = await fetch( tagurl, {
		method: 'POST',
		headers: new Headers( {
			'Content-Type': 'application/json',
			Authorization: `Basic ${ Buffer.from( process.env.tc_auth ).toString( 'base64' ) }`,
		} ),
		body: jsonTags,
	} );
	if ( res.status !== 200 ) {
		console.error( 'Tagging the build failed!' );
	}
}

async function addGitHubComment( _changedApps ) {
	const notifyApps = _changedApps.filter( ( { ghNotify = true } ) => ghNotify );

	const commentWatermark = 'calypso-app-artifacts';
	const ghCommentCmd = `./bin/add-pr-comment.sh ${ process.env.git_branch } ${ commentWatermark }`;

	if ( ! notifyApps.length ) {
		console.info( 'No apps to notify about. Deleting existing comment if exists.' );
		// Delete the existing comment, since there are no apps to notify about.
		return await exec( `${ ghCommentCmd } delete <<< "" || true`, {
			encoding: 'UTF-8',
			stdio: 'inherit',
		} );
	}

	const header = '**This PR modifies the release build for the following Calypso Apps:**';
	const docsMsg = '_For info about this notification, see here: PCYsg-OT6-p2_';
	const changedAppsMsg = notifyApps.map( ( { slug } ) => `* ${ slug }` ).join( '\n' );
	// Note: extra escaping is necessary because the message is passed to bash.
	const testMsg =
		'To test WordPress.com changes, run \\`install-plugin.sh \\$pluginSlug ' +
		process.env.git_branch +
		'\\` on your sandbox.';

	const appMsg = `${ header }\n\n${ docsMsg }\n\n${ changedAppsMsg }\n\n${ testMsg }`;

	await exec( `${ ghCommentCmd } <<- EOF || true\n${ appMsg }\nEOF`, {
		encoding: 'UTF-8',
	} );
}

async function sendSlackNotification( _changedApps ) {
	const notifyApps = _changedApps.filter( ( { slackNotify = false } ) => slackNotify );

	if ( ! notifyApps.length ) {
		console.info( 'No apps to notify about. Skipping Slack notification.' );
		return;
	}

	// TODO: move from one to multiple plugins!
	const body = `commit=${ process.env.commit_sha }&plugin=$pluginSlug`;

	const signature = createHmac( 'sha256', process.env.mc_auth_secret )
		.update( body )
		.digest( 'hex' );

	console.log( `Sending data to slack endpoint: ${ body }` );
	const res = await fetch( `${ process.env.mc_post_root }?plugin-deploy-reminder`, {
		method: 'POST',
		headers: new Headers( {
			'Content-Type': 'application/x-www-form-urlencoded',
			'TEAMCITY-SIGNATURE': signature,
		} ),
		body,
	} );
	if ( res.status !== 200 ) {
		console.error( 'Slack notification failed!' );
		console.error( 'Details: ', await res.text() );
	}
}

function checkEnvVars() {
	const requiredVars = [
		'tc_auth',
		'git_branch',
		'build_id',
		'GH_TOKEN',
		'is_default_branch',
		'skip_build_diff',
		'mc_auth_secret',
		'commit_sha',
		'mc_post_root',
		'tc_sever_url',
	];

	// Undefined and empty strings will be detected.
	const missingVars = requiredVars.filter( ( varName ) => ! process.env[ varName ] );
	if ( missingVars.length > 0 ) {
		console.error( `Missing required environment variables: ${ missingVars.join( ', ' ) }` );
		process.exit( 1 );
	}
}
