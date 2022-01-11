import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { LaunchOptions, BrowserContextOptions, devices } from 'playwright';
import env from './env-variables';

const createLogger = () => {
	const logFilePath = path.join( env.ARTIFACTS_PATH, `playwright-${ Date.now() }.log` );

	return async ( name: string, severity: string, message: string ) => {
		await fs.appendFile(
			logFilePath,
			`${ new Date().toISOString() } ${ process.pid } ${ name } ${ severity }: ${ message }\n`
		);
	};
};

const getTargetDeviceOptions = () => {
	const viewportName = env.VIEWPORT_NAME;
	let deviceName: string;

	switch ( viewportName ) {
		case 'mobile':
			deviceName = 'Pixel 4a (5G)';
			break;
		case 'desktop':
			deviceName = 'Desktop Chrome HiDPI';
			break;
	}

	if ( ! deviceName ) {
		throw Error( `Unsupported viewport: ${ viewportName }` );
	}

	const options = devices[ deviceName ];

	if ( ! options ) {
		throw Error( `Device options unavailable for ${ name }` );
	}

	return options;
};

const targetDeviceOptions = getTargetDeviceOptions();

const launchOptions: LaunchOptions = {
	args: [ '--window-position=0,0' ],
	headless: env.HEADLESS,
	slowMo: env.SLOW_MO,
};

const contextOptions: BrowserContextOptions = {
	...targetDeviceOptions,
	userAgent: `${ targetDeviceOptions.userAgent } wp-e2e-tests`,
	recordVideo: { dir: os.tmpdir() },
	logger: {
		log: createLogger(),
		isEnabled: ( name ) => name === 'api',
	},
};

export default Object.freeze( {
	launchOptions,
	contextOptions,
} );
