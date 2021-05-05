/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import * as mediaHelper from '../media-helper';

const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );

export async function takeScreenshot() {
	this.timeout( afterHookTimeoutMS );

	if ( this.currentTest && this.currentTest.state === 'failed' ) {
		await mediaHelper.takeScreenshot( this.currentTest );
	}
}
