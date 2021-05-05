/**
 * External dependencies
 */
import { spawn } from 'child_process';
import { exists } from 'fs/promises';

/**
 * Internal dependencies
 */
import * as mediaHelper from '../media-helper';

let xvfb;
let displayNum;

const getFreeDisplay = async () => {
	let i = 99 + Math.round( Math.random() * 100 );
	while ( await exists( `/tmp/.X${ i }-lock` ) ) {
		i++;
	}
	return i;
};

export const startFramebuffer = async () => {
	displayNum = await getFreeDisplay();
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
	xvfb.kill();
};

export async function takeScreenshot() {
	if ( ! this.currentTest || this.currentTest.state !== 'failed' ) {
		return;
	}

	await mediaHelper.takeScreenshot( this.currentTest );
}
