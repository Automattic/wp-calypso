interface OpenPopupOptions {
	url: string;
	popupId: string;
	expectedEvent: string;
}

export const openPopup = < T = void >( { url, popupId, expectedEvent }: OpenPopupOptions ) => {
	return new Promise< T >( ( resolve, reject ) => {
		let popup: Window | null;

		try {
			const width = 700;
			const height = 600;

			const top = window.screen.height / 2 - height / 2;
			const left = window.screen.width / 2 - width / 2;

			popup = window.open(
				url,
				popupId,
				`width=${ width },height=${ height },top=${ top },left=${ left }`
			);
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
