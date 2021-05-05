/**
 * External dependencies
 */
import { spawn } from 'child_process';
import { access } from 'fs/promises';

/**
 * Internal dependencies
 */
import * as mediaHelper from '../media-helper';

let xvfb;
let displayNum;

const getFreeDisplay = async () => {
	// eslint-disable-next-line no-constant-condition
	while ( true ) {
		const i = 99 + Math.round( Math.random() * 100 );
		try {
			await access( `/tmp/.X${ i }-lock` );
			// File exists, retry with another port
		} catch ( e ) {
			// File doesn't exist, we found a free port
			return i;
		}
	}
};

export const startFramebuffer = async () => {
	displayNum = await getFreeDisplay();
	console.log( displayNum );
	global.displayNum = displayNum;
	xvfb = spawn( 'Xvfb', [
		'-ac',
		`:${ displayNum }`,
		'-screen',
		'0',
		'1440x1000x24',
		'+extension',
		'RANDR',
	] );
};

export const stopFramebuffer = async () => {
	if ( ! xvfb ) return;

	xvfb.kill();
};

export async function takeScreenshot() {
	if ( ! this.currentTest || this.currentTest.state !== 'failed' ) {
		return;
	}

	await mediaHelper.takeScreenshot( this.currentTest );
}
