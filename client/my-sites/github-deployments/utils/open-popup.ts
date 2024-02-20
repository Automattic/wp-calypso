interface OpenPopupOptions {
	url: string;
	popupId: string;
	expectedEvent: string;
}

export const openPopup = < T = void >( { url, popupId, expectedEvent }: OpenPopupOptions ) => {
	return new Promise< T >( ( resolve, reject ) => {
		let popup: Window | null;

		try {
			popup = window.open( url, popupId, 'height=600,width=700' );
		} catch {
			return reject();
		}

		if ( ! popup ) {
			return reject();
		}

		let interval: number | null = null;
		let handleMessage: Window[ 'onmessage' ] | null = null;
		let hasResolved = false;

		const clearListeners = () => {
			if ( null !== interval ) {
				clearInterval( interval );
			}

			if ( null !== handleMessage ) {
				window.removeEventListener( 'message', handleMessage );
			}
		};

		handleMessage = ( event: MessageEvent ) => {
			const { data } = event;

			if ( ! data ) {
				return;
			}

			if ( expectedEvent === data.type ) {
				clearListeners();
				hasResolved = true;
				resolve( data );
			}
		};

		interval = window.setInterval( () => {
			if ( popup?.closed && ! hasResolved ) {
				clearListeners();
				reject();
			}
		}, 500 );

		window.addEventListener( 'message', handleMessage );
	} );
};
