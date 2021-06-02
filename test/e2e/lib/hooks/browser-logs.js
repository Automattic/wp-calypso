/**
 * External dependencies
 */
import fs from 'fs/promises';

/**
 * Internal dependencies
 */
import { getBrowserLogs, getPerformanceLogs } from '../driver-helper';
import { generatePath } from '../test-utils';

export const saveBrowserLogs = async () => {
	try {
		await Promise.allSettled(
			[
				[ () => getBrowserLogs( this.driver ), 'console.log' ],
				[ () => getPerformanceLogs( this.driver ), 'performance.log' ],
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
