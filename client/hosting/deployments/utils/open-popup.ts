interface OpenPopupOptions {
	url: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onMessage( message: any, popup: Window ): void;
}

export const openPopup = ( { url, onMessage }: OpenPopupOptions ) => {
	let popup: Window | null;

	try {
		const width = 700;
		const height = 600;

		const top = window.screen.height / 2 - height / 2;
		const left = window.screen.width / 2 - width / 2;

		popup = window.open(
			url,
			undefined,
			`popup=1,width=${ width },height=${ height },top=${ top },left=${ left }`
		);
	} catch {
		return false;
	}

	const handleMessage = ( event: MessageEvent ) => {
		const { data } = event;

		if ( ! data || ! popup ) {
			return;
		}

		onMessage( data, popup );
	};

	window.addEventListener( 'message', handleMessage );

	const interval = window.setInterval( () => {
		if ( ! popup || popup.closed ) {
			clearInterval( interval );
			window.removeEventListener( 'message', handleMessage );
		}
	}, 500 );

	return true;
};
