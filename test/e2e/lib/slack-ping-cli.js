/**
 * Internal dependencies
 */
import * as slackNotifier from './slack-notifier';

if ( process.argv.length !== 3 ) {
	console.log( `Usage: babel-node --presets es2015 ${ process.argv[ 1 ] }` );
} else {
	slackNotifier.warn( process.argv[ 2 ] );
}
