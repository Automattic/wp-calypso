/** @format */

/**
 * Internal dependencies
 */
import userAgent from 'lib/user-agent';

function preventScrollBounceOSX( body, event ) {
	if (
		( event.deltaY < 0 && body.scrollTop === 0 ) ||
		( event.deltaY > 0 && body.scrollTop === body.scrollHeight - this.innerHeight )
	) {
		event.preventDefault();
	}
}

export default function( body ) {
	if ( userAgent.platform === 'Apple Mac' ) {
		body.addEventListener( 'mousewheel', preventScrollBounceOSX.bind( window, body ) );
	}
}
