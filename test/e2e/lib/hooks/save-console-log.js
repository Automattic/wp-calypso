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

		await Promise.allSettled(
			[
				[ getBrowserLogs( driver ), 'console.log' ],
				[ getPerformanceLogs( driver ), 'performance.log' ],
			].map( async ( [ logsPromise, file ] ) => {
				const logs = await logsPromise;
				return fs.writeFile( generatePath( file ), JSON.stringify( logs, null, 2 ) );
			} )
		);
	} );
};
