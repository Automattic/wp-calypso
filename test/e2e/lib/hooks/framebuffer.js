/**
 * External dependencies
 */
import { spawn } from 'child_process';
import { access, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { generatePath, getTestNameWithTime } from '../test-utils';

export const getFreeDisplay = async () => {
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

export const buildHooks = ( displayNum ) => {
	let xvfb;

	const startFramebuffer = async () => {
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

	const stopFramebuffer = async () => {
		try {
			if ( ! xvfb ) return;

			xvfb.kill();
		} catch ( err ) {
			console.warn(
				'Got an error trying to stop the framebuffer. This IS NOT causing the test to break, is just a warning'
			);
			console.warn( 'Original error:' );
			console.warn( err );
		}
	};

	async function takeScreenshot() {
		if ( ! this.currentTest || this.currentTest.state !== 'failed' ) {
			return;
		}

		try {
			const fileName = generatePath(
				`screenshots/${ getTestNameWithTime( this.currentTest ) }.png`
			);
			await mkdir( path.dirname( fileName ), { recursive: true } );

			const driver = this.driver;
			const screenshotData = await driver.takeScreenshot();
			await writeFile( fileName, screenshotData, { encoding: 'base64' } );
		} catch ( err ) {
			console.warn(
				'Got an error trying to save a screenshot from the browser. This IS NOT causing the test to break, is just a warning'
			);
			console.warn( 'Original error:' );
			console.warn( err );
		}
	}

	return { startFramebuffer, stopFramebuffer, takeScreenshot };
};
