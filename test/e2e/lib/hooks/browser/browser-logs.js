import fs from 'fs/promises';
import path from 'path';
import { logging } from 'selenium-webdriver';

export const saveBrowserLogs = async ( { tempDir, driver } ) => {
	return await Promise.allSettled(
		[
			[ () => driver.manage().logs().get( logging.Type.BROWSER ), 'console.log' ],
			[ () => driver.manage().logs().get( logging.Type.PERFORMANCE ), 'performance.log' ],
		].map( async ( [ logsPromise, file ] ) => {
			const logs = await logsPromise();
			return await fs.writeFile( path.join( tempDir, file ), JSON.stringify( logs, null, 2 ) );
		} )
	);
};
