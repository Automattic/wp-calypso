import { spawn } from 'child_process';
import { accessSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getTestNameWithTime } from '../../test-utils';

export const getFreeDisplay = () => {
	while ( true ) {
		const i = 99 + Math.round( Math.random() * 100 );
		try {
			accessSync( `/tmp/.X${ i }-lock` );
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
		return new Promise( ( resolve, reject ) => {
			xvfb = spawn( 'Xvfb', [
				'-ac',
				`:${ displayNum }`,
				'-screen',
				'0',
				'1440x1000x24',
				'+extension',
				'RANDR',
			] );
			xvfb.on( 'error', reject );
			// If there is no error in 100ms, assume the process spawned successfully
			// TODO Node 15+ has a better way to do this (https://nodejs.org/api/child_process.html#child_process_event_spawn)
			setTimeout( resolve, 100 );
		} );
	};

	const stopFramebuffer = async () => {
		xvfb.kill();
	};

	async function takeScreenshot( { tempDir, testName, driver } ) {
		const fileName = path.join(
			tempDir,
			'screenshots',
			`${ getTestNameWithTime( testName ) }.png`
		);
		await mkdir( path.dirname( fileName ), { recursive: true } );
		const screenshotData = await driver.takeScreenshot();
		await writeFile( fileName, screenshotData, { encoding: 'base64' } );
	}

	return { startFramebuffer, stopFramebuffer, takeScreenshot };
};
