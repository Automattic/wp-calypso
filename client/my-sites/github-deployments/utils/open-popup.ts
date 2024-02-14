interface OpenPopupOptions {
	url: string;
	popupId: string;
}

export const openPopup = ( { url, popupId }: OpenPopupOptions ) => {
	return new Promise< void >( ( resolve, reject ) => {
		let popup: Window | null;

		try {
			popup = window.open( url, popupId, 'height=600,width=700' );
		} catch {
			return reject();
		}

		if ( ! popup ) {
			reject();
		}

		const interval = setInterval( (): void => {
			if ( popup?.closed ) {
				resolve();
				clearInterval( interval );
			}
		}, 500 );
	} );
};
