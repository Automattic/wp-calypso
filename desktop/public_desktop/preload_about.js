const { ipcRenderer, contextBridge } = require( 'electron' );

( async () => {
	const config = await ipcRenderer.invoke( 'get-config' );
	contextBridge.exposeInMainWorld( 'electron', {
		config,
	} );
} )();
