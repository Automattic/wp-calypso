/**
 * External Dependencies
 */
const { URL } = require( 'url' );
const { promisify } = require( 'util' ); // eslint-disable-line import/no-nodejs-modules
const { dialog, ipcMain: ipc } = require( 'electron' );

/**
 * Internal dependencies
 */
const Settings = require( 'app/lib/settings' );
const openInBrowser = require( '../open-in-browser' );
const { showMySites } = require( 'app/lib/calypso-commands' );
const settingConstants = require( 'app/lib/settings/constants' );
const log = require( 'app/lib/logger' )( 'desktop:external-links:handle-jetpack' );

/**
 * Module variables
 */
const delay = promisify( setTimeout );

// Invokes the activation of Secure Sign-On ("SSO") for the remote site
// by sending messages over IPC to Calypso. Because we should not block
// the renderer process by sending mesages synchronously, each step sets
// and cleans up a handler that listens on a corresponding response channel.
//
// Steps:
// 1. Enable option (set/clean up handler on response channel)
// 2. Refresh site info (set/clean up handler on response channel)
// 3. Navigate to the editor
function selectedEnableSSOandContinue( mainWindow, info ) {
	log.info( "User selected 'Enable SSO and Continue'..." );

	const channelDidEnableSiteOption = 'enable-site-option-response';
	const channelDidRequestSite = 'request-site-response';

	const { siteId, origin, editorUrl } = info;

	const handleDidRequestSite = ( _, { error } ) => {
		ipc.removeAllListeners( channelDidRequestSite );
		if ( error ) {
			throw error;
		}
		log.info( `Refreshed info for site: '${ origin }', navigating to URL: '${ editorUrl }'` );
		mainWindow.webContents.send( 'navigate', editorUrl );
	};

	const handleDidEnableSiteOption = ( _, { error } ) => {
		ipc.removeAllListeners( channelDidEnableSiteOption );
		if ( error ) {
			throw error;
		}
		log.info( `SSO enabled for site: '${ origin }', requesting site refresh...` );
		ipc.on( channelDidRequestSite, handleDidRequestSite );
		mainWindow.webContents.send( 'request-site', siteId );
	};

	ipc.on( channelDidEnableSiteOption, handleDidEnableSiteOption );
	mainWindow.webContents.send( 'enable-site-option', { siteId, option: 'sso' } );
}

function selectedProceedInBrowser( mainWindow, { origin, wpAdminLoginUrl } ) {
	log.info( "User selected 'Proceed in Browser'..." );
	openInBrowser( wpAdminLoginUrl );
	navigateToShowMySites( mainWindow, origin );
}

function selectedCancel( mainWindow, { origin } ) {
	log.info( "User selected 'Cancel' with origin ...", origin );
	navigateToShowMySites( mainWindow, origin );
}

function navigateToShowMySites( mainWindow, domain ) {
	showMySites( mainWindow );
	// Update last location so a redirect isn't automatically triggered on app relaunch.
	Settings.saveSetting(
		settingConstants.LAST_LOCATION,
		`/stats/day/${ new URL( domain ).hostname }`
	);
}

/**
 * Prompts the user when they are unable to navigate to the Gutenberg editor due to lack
 * of sufficient permissions for the self-hosted site.
 *
 * The user may select one of three options to continue:
 *
 *	1. Enable Secure Sign On and Continue
 *	2. Proceed in Browser (via wpAdmin redirect)
 *	3. Cancel
 * Users that can manage site options will be presented with all three options. All others
 * are presented with the option to Cancel or Proceed in Browser only.
 *
 * FIXME: Implementing this logic (including UI dialogs) may be a lot cleaner if done
 * wholly within Calypso (minimize necessity of async workarounds over IPC).
 *
 * @param {object} mainWindow Reference to the main window object.
 * @param {object} info Payload from Calypso containing relevant user- and site-specific information.
 */
async function handleJetpackEnableSSO( mainWindow, info ) {
	log.info( `Prompting user to enable SSO for site: '${ info.origin }'...` );

	const { origin, canUserManageOptions } = info;

	const buttons = [ 'Proceed in Browser', 'Cancel' ];
	if ( canUserManageOptions ) {
		buttons.unshift( 'Enable SSO and Continue' );
	}

	try {
		// Allow sufficient time for Gutenberg's "placeholder" UI to render.
		// Otherwise, exiting the placeholder UI will make Calypso's masterbar and
		// sidebars disappear.
		await delay( 300 );

		let message =
			'This feature requires that Secure Sign-On is enabled in the Jetpack settings of the site:' +
			'\n\n' +
			`${ origin }`;
		if ( ! canUserManageOptions ) {
			// If the user cannot manage site options,
			// prompt them to contact the site admin.
			message += '\n\n' + 'Please contact the site admin.';
		}

		const selected = await dialog.showMessageBox( mainWindow, {
			type: 'info',
			buttons: buttons,
			title: 'Jetpack Authorization Required',
			message,
			detail:
				"You may proceed after changing the site's Jetpack settings " +
				'or you can proceed in an external browser.',
		} );

		const button = selected.response;

		switch ( button ) {
			case 0:
				if ( canUserManageOptions ) {
					selectedEnableSSOandContinue( mainWindow, info );
				} else {
					selectedProceedInBrowser( mainWindow, info );
				}
				break;
			case 1:
				if ( canUserManageOptions ) {
					selectedProceedInBrowser( mainWindow, info );
				} else {
					selectedCancel( mainWindow, info );
				}
				break;
			case 2:
				selectedCancel( mainWindow, info );
				break;
		}
	} catch ( error ) {
		log.error( 'Failed to prompt for Jetpack authorization: ', error );
		navigateToShowMySites( mainWindow, origin );
	}
}

function handleUndefined( mainWindow, info ) {
	log.error( 'Cannot use editor, unhandled reason: ', info );

	dialog.showMessageBox( mainWindow, {
		type: 'info',
		buttons: [ 'OK' ],
		title: 'Unable to Use the Editor',
		message: 'An unhandled error occurred. ' + 'Please contact help@wordpress.com for help.',
	} );

	const { origin, wpAdminLoginUrl, editorUrl } = info;
	if ( wpAdminLoginUrl ) {
		log.info(
			`Falling back to opening editor in browser with admin login URL: '${ wpAdminLoginUrl }'`
		);
		openInBrowser( wpAdminLoginUrl );
	} else if ( editorUrl ) {
		log.info( `Falling back to opening editor in browser with editor URL: '${ editorUrl }'` );
		openInBrowser( editorUrl );
	} else {
		log.error( 'Failed to open editor in browser as fallback: invalid admin and editor urls' );
	}
	navigateToShowMySites( mainWindow, origin );
}

module.exports = {
	handleJetpackEnableSSO,
	handleUndefined,
};
