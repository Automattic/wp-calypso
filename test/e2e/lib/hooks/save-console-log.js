/* eslint-disable mocha/no-top-level-hooks */
import fs from 'fs/promises';

/**
 * Internal dependencies
 */
import { getBrowserLogs, getPerformanceLogs } from '../driver-helper';
import { generatePath } from '../test-utils';

export default () => {
	after( 'Save browser logs', async function () {
		const driver = global.__BROWSER__;

		try {
			await Promise.allSettled(
				[
					[ getBrowserLogs( driver ), 'console.log' ],
					[ getPerformanceLogs( driver ), 'performance.log' ],
				].map( async ( [ logsPromise, file ] ) => {
					const logs = await logsPromise;
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
	} );
};
