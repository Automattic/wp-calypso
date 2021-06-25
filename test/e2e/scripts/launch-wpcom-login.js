/**
 * Internal dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import path from 'path';

import LoginFlow from '../lib/flows/login-flow.js';

const driver = driverManager.startBrowser( { tempDir: path.join( __dirname, '..' ) } );
let accountName = 'defaultUser';

// Look for command line arguments
if ( process.argv.length > 1 ) {
	accountName = process.argv[ 2 ];
}

const loginFlow = new LoginFlow( driver, accountName );
loginFlow.login();
