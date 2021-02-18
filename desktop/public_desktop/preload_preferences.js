const { ipcRenderer, contextBridge } = require( 'electron' );

( async () => {
	const preferences = await ipcRenderer.invoke( 'get-settings' );
	contextBridge.exposeInMainWorld( 'electron', {
		send: ( channel, data ) => {
			// Possible values: preferences-changed or preferences-changed-<preference_name>
			if ( channel.startsWith( 'preferences-changed' ) ) {
				ipcRenderer.send( channel, data );
			}
		},
		preferences,
	} );
} )();
