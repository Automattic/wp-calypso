// NOTE: if we decide to use this again in the future, see https://github.com/Automattic/wp-calypso/pull/85597
// for more context on why this was disabled. It needs to be updated to avoid
// adding so much noise to the channel.
import fs from 'fs';
import { exit } from 'process';
import yargs from 'yargs';

/* CLI Arguments */

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
 * Opens and parses the test result JSON produced by Jest.
 * @returns {JSON} JSON parsed test suite result.
 * @throws {Error} If file was not present.
 */
function openJestOutputJSON() {
	let data;
	try {
		fs.accessSync( filePath );
		data = fs.readFileSync( filePath, 'utf8' );
	} catch ( error ) {
		console.error( 'An error occurred while accessing the file:', error );
		exit();
	}
	return JSON.parse( data );
}

/**
 * Extracts all stack traces for failing test steps.
 * @param {JSON} results Test suite results produced by Jest.
 * @returns {{step: string, error: string}[]} Array of failure objects.
 */
function extractFailureMessages( results ) {
	const failureMessages = [];

	// Short circuit if nothing consistently failed.
	// Consistently here means failed on both initial run and then the retry.
	if ( ! results.numFailedTests ) {
		return failureMessages;
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
 * Builds the message to be posted to Slack using Block Kit.
 * @param {{step: string, error: string}[]} failures Array of failure objects.
 * @returns {JSON} Body for the POST request.
 */
function buildSlackMessage( failures ) {
	// Build the body using Slack Block Kit.
	const body = {
		channel: 'C02DQP0FP',
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `:x: E2E Build Failed on branch *${ process.env.tc_build_branch }*: ${ process.env.tc_project_name }: ${ process.env.tc_build_conf_name }, #${ process.env.tc_build_number }`,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `:teamcity: <${ process.env.BUILD_URL }|*Build*>`,
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
			{ type: 'divider' }
		);
	}
	body.blocks.push( {
		type: 'section',
		text: {
			type: 'mrkdwn',
			// text: 'placeholder text so that I do not waste a8c GPT bandwidth',
			text: '@gpt, can you tell me more about the error(s) above, provide link(s) to the E2E test file in GitHub, and a snippet of the relevant code section?',
		},
	} );
	return body;
}

/**
 * Sends the message to Slack.
 * @param {JSON} body Body for the POST request.
 * @returns {Promise<Response>} Response from Slack endpoint.
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

const json = openJestOutputJSON( filePath );
if ( ! json ) {
	exit();
}
const failures = extractFailureMessages( json );
if ( failures.length === 0 ) {
	exit();
}
const body = buildSlackMessage( failures );
await postMessage( body );
