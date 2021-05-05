/**
 * External dependencies
 */
import { spawn } from 'child_process';
import { access, mkdir } from 'fs/promises';
import pngitxt from 'png-itxt';
import { pipeline } from 'stream';
import path from 'path';
import { createWriteStream } from 'fs';
import { promisify } from 'util';

let xvfb;
let displayNum;

const screenshotsDir = path.resolve(
	process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' ),
	process.env.SCREENSHOTDIR || 'screenshots'
);

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

	const currentTestName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	const fileName = path.resolve(
		path.join( screenshotsDir, `${ currentTestName }-${ dateTime }.png` )
	);
	await mkdir( path.dirname( fileName ), { recursive: true } );

	const driver = global.__BROWSER__;
	const screenshotData = await driver.takeScreenshot();
	const url = await driver.getCurrentUrl();

	return promisify( pipeline )(
		screenshotData,
		pngitxt.set( { keyword: 'url', valye: url } ),
		createWriteStream( fileName )
	);
}
