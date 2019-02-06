/** @format */

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

const driver = driverManager.startBrowser();
var accountName = 'defaultUser';

// Look for command line arguments
if ( process.argv.length > 1 ) {
	accountName = process.argv[ 2 ];
}

let loginFlow = new LoginFlow( driver, accountName );
loginFlow.login();
