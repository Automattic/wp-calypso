/**
 * External dependencies
 */
import assert from 'assert';
import { get } from 'lodash';
import speakeasy from 'speakeasy';
import config from 'config';
import playwright from 'playwright';

/**
 * External dependencies
 */
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import EmailClient from '../lib/email-client.js';
import { listenForSMS } from '../lib/xmpp-client';
import { subscribeToPush, approvePushToken } from '../lib/push-client';
import ReaderPage from '../lib/pages/reader-page';
import ProfilePage from '../lib/pages/profile-page';
import WPHomePage from '../lib/pages/wp-home-page';
import MagicLoginPage from '../lib/pages/magic-login-page';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import LoggedOutMasterbarComponent from '../lib/components/logged-out-masterbar-component';

import LoginFlow from '../lib/flows/login-flow';
import LoginPage from '../lib/pages/login-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Playwright Canary: (${ screenSize }) @playwright @parallel`, function () {
	describe( 'Loading the log-in screen using Playwright', function () {
		step( 'Can see the log in screen', async function () {
			process.env.PLAYWRIGHT_BROWSERS_PATH = '~/workspace';
			const browser = await playwright.chromium.launch();
			await browser.close();
		} );
	} );
} );
