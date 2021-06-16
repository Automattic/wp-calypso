/**
 * External dependencies
 */
import fs from 'fs/promises';
import { logging } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import { generatePath } from '../../test-utils';

export const saveBrowserLogs = async ( driver ) => {
	try {
		await Promise.allSettled(
			[
				[ () => driver.manage().logs().get( logging.Type.BROWSER ), 'console.log' ],
				[ () => driver.manage().logs().get( logging.Type.PERFORMANCE ), 'performance.log' ],
			].map( async ( [ logsPromise, file ] ) => {
				const logs = await logsPromise();
				return fs.writeFile( generatePath( file ), JSON.stringify( logs, null, 2 ) );
			} )
		);
	} catch ( err ) {
		console.warn(
			'Got an error trying to save logs from the browser. This IS NOT causing the test to break, is just a warning'
		);
		console.warn( 'Original error:' );
		console.warn( err );
	}
};
