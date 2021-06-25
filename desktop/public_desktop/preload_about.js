const { ipcRenderer, contextBridge } = require( 'electron' );

( async () => {
	const config = await ipcRenderer.invoke( 'get-config' );
	contextBridge.exposeInMainWorld( 'electron', {
		send: ( channel, ...args ) => {
			if ( channel === 'secrets' ) {
				ipcRenderer.send( channel, ...args );
			}
		},
		config,
	} );
} )();
