import fs from 'fs';
import { exit } from 'process';
import util from 'util';
import fetch from 'node-fetch';
import yargs from 'yargs';

/* CLI Arguments */

/**
 *
 */
const { argv } = yargs( process.argv ).options( {
	file: {
		type: 'string',
		required: true,
		describe: 'Path to a JSON file produced by Jest',
	},
} );

const filePath = argv.file;

/* Methods */

/**
 *
 * @returns
 */
function openFailuresJSON() {
	try {
		const data = fs.readFileSync( filePath, 'utf8' );

		return JSON.parse( data );
	} catch ( error ) {
		console.error( 'An error occurred while reading the JSON file:', error );
	}
}

/**
 *
 * @param {*} results
 * @returns
 */
// Function to recursively search for "failureMessages" in the JSON
function extractFailureMessages( results ) {
	const failureMessages = [];

	// Short circuit if nothing consistently failed.
	// Consistently here means failed on both initial run and then the retry.
	if ( ! results.numFailedTests ) {
		exit();
	}

	for ( const result of results.testResults ) {
		for ( const step of result.assertionResults ) {
			if ( step.failureMessages.length !== 0 ) {
				failureMessages.push( { step: step.ancestorTitles, error: step.failureMessages } );
			}
		}
	}
	return failureMessages;
}

/**
 *
 * @param {*} failures
 * @returns
 */
function buildSlackMessage( failures ) {
	// Build the body using Slack Block Kit.
	const body = {
		channel: 'C0615Q8GMFX',
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `:x: E2E Build Failed: ${ process.env.tc_project_name }: ${ process.env.tc_build_conf_name }, #${ process.env.tc_build_number }`,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: ':teamcity: <https://teamcity.a8c.com/buildConfiguration/calypso_calypso_WebApp_Calypso_E2E_Playwright_desktop/11093402?buildTab=log&focusLine=613&linesState=530.586.587.588.589.665.666.667.668&logView=flowAware|*Build*>',
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'header',
				text: {
					type: 'plain_text',
					text: 'Stacktraces',
				},
			},
		],
	};
	for ( const failure of failures ) {
		body.blocks.push(
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text:
						'*' + failure.step.join( ': ' ) + '*' + '\n' + '```' + failure.error.pop() + '\n```',
				},
			},
			{ type: 'divider' },
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: 'placeholder text so that I do not waste a8c GPT bandwidth',
					// text: '@gpt, can you tell me more about the error in the section above, and give me a link to the E2E test file in GitHub?',
				},
			}
		);
	}

	console.log( util.inspect( body, { showHidden: false, depth: null, colors: true } ) );
	return body;
}

/**
 *
 * @param {*} body
 * @returns
 */
async function postMessage( body ) {
	return await fetch( 'https://slack.com/api/chat.postMessage', {
		method: 'POST',
		headers: {
			'Content-type': 'application/json; charset=utf-8',
			Authorization: `Bearer ${ process.env.slack_oauth_token }`,
		},
		body: JSON.stringify( body ),
	} );
}

// Build a mapping of test steps that failed and the corresponding stacktrace.
const json = openFailuresJSON( filePath );
const failures = extractFailureMessages( json );
const body = buildSlackMessage( failures );
const response = await postMessage( body );
console.log( await response.json() );
