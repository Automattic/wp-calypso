function preventScrollBounceOSX( body, event ) {
	if (
		( event.deltaY < 0 && body.scrollTop === 0 ) ||
		( event.deltaY > 0 && body.scrollTop === body.scrollHeight - this.innerHeight )
	) {
		event.preventDefault();
	}
}

export default function ( body ) {
	if (
		window &&
		window.navigator &&
		window.navigator.userAgent &&
		window.navigator.userAgent.indexOf( 'Macintosh' ) !== -1
	) {
		body.addEventListener( 'mousewheel', preventScrollBounceOSX.bind( window, body ) );
	}
}
