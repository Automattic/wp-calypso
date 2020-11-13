const { ipcRenderer, contextBridge } = require( 'electron' );

const sendChannels = [ 'preferences-changed', 'preferences-changed-' ];

( async () => {
	const preferences = await ipcRenderer.invoke( 'get-settings' );
	contextBridge.exposeInMainWorld( 'electron', {
		send: ( channel, data ) => {
			if ( sendChannels.includes( channel ) ) {
				ipcRenderer.send( channel, data );
			}
		},
		preferences,
	} );
} )();
