/**
 * External dependencies
 */
import config from 'config';
import slack from 'slack-notify';

/**
 * Internal dependencies
 */
import * as driverManager from './driver-manager';
import * as dataHelper from './data-helper';

const messages = [];

export function warn( message, { suppressDuplicateMessages = false } = {} ) {
	if (
		( suppressDuplicateMessages === true && messages.indexOf( message ) === -1 ) ||
		suppressDuplicateMessages === false
	) {
		console.log( message );
		const slackHook = dataHelper.configGet( 'slackHook' );

		if (
			slackHook &&
			config.has( 'reportWarningsToSlack' ) &&
			config.get( 'reportWarningsToSlack' ) === true
		) {
			const currentScreenSize = driverManager.currentScreenSize();
			const detailedMessage = `${ message } - encountered on '${ global.browserName }' at screen size '${ currentScreenSize }' in CircleCI build #${ process.env.CIRCLE_BUILD_NUM } on branch '${ process.env.CIRCLE_BRANCH }'`;
			const slackClient = slack( slackHook );
			slackClient.send( {
				icon_emoji: ':a8c:',
				text: detailedMessage,
				username: 'WebDriverJS',
			} );
		}
		messages.push( message );
	}
}
