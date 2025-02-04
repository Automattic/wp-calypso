import { LaunchOptions, BrowserContextOptions, devices } from 'playwright';
import envVariables from '../env-variables';

const getTargetDeviceOptions = () => {
	const viewportName = envVariables.VIEWPORT_NAME;
	let deviceName: string;

	switch ( viewportName ) {
		case 'mobile':
			deviceName = 'Pixel 4a (5G)';
			break;
		case 'desktop':
			deviceName = 'Desktop Chrome HiDPI';
			break;
		default:
			throw new Error( 'No viewport specified.' );
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

// Options for the BrowserType.
// https://playwright.dev/docs/api/class-browsertype
const launchOptions: LaunchOptions = {
	headless: envVariables.HEADLESS,
	slowMo: envVariables.SLOW_MO,
	args: [ '--disable-quic' ],
};

// Options for the BrowserContext level.
// https://playwright.dev/docs/api/class-browsercontext
const contextOptions: BrowserContextOptions = {
	...targetDeviceOptions,
	userAgent: `${ targetDeviceOptions.userAgent } wp-e2e-tests`,
};

export default Object.freeze( {
	launchOptions,
	contextOptions,
} );
