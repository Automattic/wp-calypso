const { dialog } = require( 'electron' );

/**
 * Handles client responses to the beforeunload event. Electron doesn't have a default implementation
 * like browsers do, so we need to provide our own.
 */
module.exports = function ( { view, window } ) {
	view.webContents.on( 'will-prevent-unload', ( event ) => {
		const choice = dialog.showMessageBoxSync( window, {
			type: 'question',
			buttons: [ 'Stay', 'Leave' ],
			defaultId: 1,
			cancelId: 0,
			title: 'WordPress.com',
			// The beforeunload handler can set a custom message
			// e.g. https://github.com/WordPress/gutenberg/blob/4b60f9ececa96ba51d9cae4d6d7a9a1311d8b9d8/packages/editor/src/components/unsaved-changes-warning/index.js#L34
			// Unfortunately Electron doesn't give us access to that value.
			message: 'You have unsaved changes. If you proceed, they will be lost.',
		} );
		if ( choice === 1 ) {
			// preventDefault() ignores the beforeunload event handler and allow the page to be unloaded.
			event.preventDefault();
		}
	} );
};
